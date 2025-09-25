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

export const quizSubmitReducer = (state = {}, action) => {
  switch (action.type) {
    case QUIZ_SUBMIT_REQUEST:
      return { loading: true };
    case QUIZ_SUBMIT_SUCCESS:
      return { loading: false, success: true, data: action.payload };
    case QUIZ_SUBMIT_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const quizResponseReducer = (state = { response: {} }, action) => {
  switch (action.type) {
    case QUIZ_GET_RESPONSE_REQUEST:
      return { loading: true, response: {} };
    case QUIZ_GET_RESPONSE_SUCCESS:
      return { loading: false, response: action.payload };
    case QUIZ_GET_RESPONSE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const quizStatsReducer = (state = { stats: {} }, action) => {
  switch (action.type) {
    case QUIZ_GET_STATS_REQUEST:
      return { loading: true, stats: {} };
    case QUIZ_GET_STATS_SUCCESS:
      return { loading: false, stats: action.payload };
    case QUIZ_GET_STATS_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};
