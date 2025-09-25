import axios from "axios";
import {
  QUIZ_SUBMIT_REQUEST,
  QUIZ_SUBMIT_SUCCESS,
  QUIZ_SUBMIT_FAIL,
  QUIZ_GET_RESPONSE_REQUEST,
  QUIZ_GET_RESPONSE_SUCCESS,
  QUIZ_GET_RESPONSE_FAIL,
  QUIZ_GET_STATS_REQUEST,
  QUIZ_GET_STATS_SUCCESS,
  QUIZ_GET_STATS_FAIL,
} from "../constants/quizConstants";

export const submitQuiz = (quizData) => async (dispatch) => {
  try {
    dispatch({ type: QUIZ_SUBMIT_REQUEST });

    const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/quiz/submit`, quizData);

    dispatch({
      type: QUIZ_SUBMIT_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: QUIZ_SUBMIT_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const getQuizResponse = (sessionId) => async (dispatch) => {
  try {
    dispatch({ type: QUIZ_GET_RESPONSE_REQUEST });

    const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/quiz/${sessionId}`);

    dispatch({
      type: QUIZ_GET_RESPONSE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: QUIZ_GET_RESPONSE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const getQuizStats = () => async (dispatch) => {
  try {
    dispatch({ type: QUIZ_GET_STATS_REQUEST });

    const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/quiz/stats`);

    dispatch({
      type: QUIZ_GET_STATS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: QUIZ_GET_STATS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
