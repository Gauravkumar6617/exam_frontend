import type { AppDispatch } from "../../redux/store/store";
import { startGeneration, updateStream, finishGeneration } from "./examSlice";

export const startExamStream =
  (topic: string, difficulty: string, count: number, qTypes: string[]) =>
  async (dispatch: AppDispatch) => {
    console.log("🚀 --- STANDARD STREAM START ---");
    console.log("📝 Topic:", topic);
    console.log("⚙️ Params:", { difficulty, count, qTypes });

    dispatch(startGeneration(topic));

    try {
      const response = await fetch("http://127.0.0.1:8000/exam/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          difficulty,
          total_questions: count,
          q_types: qTypes,
        }),
      });

      console.log("📥 Server Response Status:", response.status);

      if (!response.ok) {
        const errorMsg = await response.text();
        console.error("❌ Server Error Detail:", errorMsg);
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        console.error("❌ Reader not available on response.");
        return;
      }

      console.log("🔗 Reading Stream Chunks...");
      let totalChunks = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log(
            "✅ Stream Complete. Total chunks received:",
            totalChunks
          );
          break;
        }

        const chunk = decoder.decode(value);
        totalChunks++;

        // CRITICAL LOG: This shows us exactly what the AI sent
        console.log(`🧩 Chunk #${totalChunks}:`, chunk);

        dispatch(updateStream(chunk));
      }
    } catch (err) {
      console.error("❌ Execution Error:", err);
    } finally {
      console.log("🏁 Standard Generation Finished.");
      dispatch(finishGeneration());
    }
  };
export const startPDFExamStream =
  (file: File, difficulty: string, count: number, qTypes: string[]) =>
  async (dispatch: AppDispatch) => {
    console.log("🛠️ Preparing PDF Stream...");
    console.log("📄 File Name:", file.name);
    console.log("📊 Parameters:", { difficulty, count, qTypes });

    dispatch(startGeneration("PDF Analysis"));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("difficulty", difficulty);
      formData.append("total_questions", count.toString());
      formData.append("q_types", JSON.stringify(qTypes));

      console.log(
        "🚀 Sending Request to: http://127.0.0.1:8000/exam/generate-from-pdf"
      );

      const response = await fetch(
        "http://127.0.0.1:8000/exam/generate-from-pdf",
        {
          method: "POST",
          body: formData,
          // Note: browser automatically sets Content-Type to multipart/form-data
        }
      );

      console.log(
        "📥 Response Received Status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server Error Detail:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      console.log("🔗 Stream Reader initialized. Starting to read chunks...");

      if (!reader) {
        console.error("❌ No reader available on response body");
        return;
      }

      let totalChunks = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log(
            "✅ Stream complete. Total chunks received:",
            totalChunks
          );
          break;
        }

        const chunk = decoder.decode(value);
        totalChunks++;

        // This prints every piece of text coming from the AI
        console.log(`🧩 Chunk #${totalChunks}:`, chunk);

        dispatch(updateStream(chunk));
      }
    } catch (err) {
      console.error("💥 Fetch Error Stack:", err);
    } finally {
      console.log("🏁 PDF Generation process finished.");
      dispatch(finishGeneration());
    }
  };

export const startWebExamStream =
  (url: string, difficulty: string, count: number, qTypes: string[]) =>
  async (dispatch: AppDispatch) => {
    console.log("🌐 Initializing Web-to-Exam Stream...");
    console.log("🔗 Target URL:", url);
    console.log("⚙️ Config:", { difficulty, count, qTypes });

    dispatch(startGeneration("Web Analysis"));

    try {
      console.log("🚀 Sending POST request to FastAPI...");
      const response = await fetch(
        "http://127.0.0.1:8000/exam/generate-from-web",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: url,
            difficulty,
            total_questions: count,
            q_types: qTypes,
          }),
        }
      );

      console.log("📥 Response Status:", response.status, response.statusText);

      if (!response.ok) {
        const errorDetail = await response.text();
        console.error("❌ Backend Error Detail:", errorDetail);
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      console.log("🔗 Stream Reader active. Waiting for first chunk...");

      if (!reader) {
        console.error("❌ Reader is null. Response body might be empty.");
        return;
      }

      let chunkCount = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log("✅ Web Stream Complete. Total chunks:", chunkCount);
          break;
        }

        const chunk = decoder.decode(value);
        chunkCount++;

        // Log the actual text coming from the AI
        console.log(`🧩 Web Chunk #${chunkCount}:`, chunk);

        dispatch(updateStream(chunk));
      }
    } catch (err) {
      console.error("💥 Web Analysis Execution Failed:", err);
    } finally {
      console.log("🏁 Web Generation Process Terminated.");
      dispatch(finishGeneration());
    }
  };

export const startPYQExtractionStream =
  (file: File, questionsLimit: number) => async (dispatch: AppDispatch) => {
    dispatch(startGeneration(`PYQ: ${file.name}`));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("questions_limit", questionsLimit.toString());

    try {
      const response = await fetch(
        "http://localhost:8000/exam/api/extract-pyq",
        {
          method: "POST",
          body: formData,
        }
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // 🚨 FIX: If the 'chunk' is somehow an object (e.g. from an automatic JSON parser),
        // stringify it before dispatching to prevent the React Child error.
        if (typeof chunk === "object") {
          dispatch(updateStream(JSON.stringify(chunk)));
        } else {
          dispatch(updateStream(chunk));
        }
      }
      return true;
    } catch (error) {
      console.error("Extraction Error:", error);
      return false;
    } finally {
      dispatch(finishGeneration());
    }
  };
