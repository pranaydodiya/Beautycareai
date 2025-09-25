import {
  FACE_ANALYSIS_REQUEST,
  FACE_ANALYSIS_SUCCESS,
  FACE_ANALYSIS_FAIL,
  FACE_ANALYSIS_RESET,
  GET_RECOMMENDATIONS_REQUEST,
  GET_RECOMMENDATIONS_SUCCESS,
  GET_RECOMMENDATIONS_FAIL,
} from '../constants/faceAnalysisConstants';

export const faceAnalysisReducer = (state = {}, action) => {
  switch (action.type) {
    case FACE_ANALYSIS_REQUEST:
      return { loading: true };
    case FACE_ANALYSIS_SUCCESS:
      return {
        loading: false,
        success: true,
        analysis: action.payload.analysis,
        recommendations: action.payload.recommendations,
      };
    case FACE_ANALYSIS_FAIL:
      return {
        loading: false,
        error: action.payload,
      };
    case FACE_ANALYSIS_RESET:
      return {};
    default:
      return state;
  }
};

export const recommendationsReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_RECOMMENDATIONS_REQUEST:
      return { loading: true };
    case GET_RECOMMENDATIONS_SUCCESS:
      return {
        loading: false,
        success: true,
        recommendations: action.payload.recommendations,
      };
    case GET_RECOMMENDATIONS_FAIL:
      return {
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};
