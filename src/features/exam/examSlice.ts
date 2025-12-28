import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface ExamState {
  streamedText: string;
  isGenerating: boolean;
  topic: string;
  userAnswers: Record<number, string>;
}

const initialState: ExamState = {
  streamedText: "",
  isGenerating: false,
  topic: "",
  userAnswers: {},
};

export const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    startGeneration: (state, action: PayloadAction<string>) => {
      state.isGenerating = true;
      state.streamedText = "";
      state.userAnswers = {};
      state.topic = action.payload;
    },
    updateStream: (state, action: PayloadAction<string>) => {
      state.streamedText += action.payload;
    },
    finishGeneration: (state) => {
      state.isGenerating = false;
    },
    selectOption: (
      state,
      action: PayloadAction<{ index: number; answer: string }>
    ) => {
      // Destructure from payload to avoid TS errors
      const { index, answer } = action.payload;
      state.userAnswers[index] = answer;
    },
    resetExam: (state) => {
      state.streamedText = "";
      state.userAnswers = {};
      state.topic = "";
      state.isGenerating = false;
    },
  },
});

export const {
  startGeneration,
  updateStream,
  finishGeneration,
  selectOption,
  resetExam,
} = examSlice.actions;

export default examSlice.reducer;
