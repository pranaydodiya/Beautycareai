import axios from 'axios';
import {
  FACE_ANALYSIS_REQUEST,
  FACE_ANALYSIS_SUCCESS,
  FACE_ANALYSIS_FAIL,
  FACE_ANALYSIS_RESET,
  GET_RECOMMENDATIONS_REQUEST,
  GET_RECOMMENDATIONS_SUCCESS,
  GET_RECOMMENDATIONS_FAIL,
} from '../constants/faceAnalysisConstants';

// @desc    Analyze face and get recommendations
export const analyzeFace = (image) => async (dispatch) => {
  try {
    dispatch({ type: FACE_ANALYSIS_REQUEST });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(
      '/api/face-analysis/analyze',
      { image },
      config
    );

    dispatch({
      type: FACE_ANALYSIS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: FACE_ANALYSIS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// @desc    Get product recommendations
export const getRecommendations = (analysisData) => async (dispatch, getState) => {
  try {
    dispatch({ type: GET_RECOMMENDATIONS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo?.token || ''}`,
      },
    };

    const { data } = await axios.get(
      `/api/face-analysis/recommendations?skinTone=${analysisData.skinTone}&undertone=${analysisData.undertone}&concerns=${analysisData.concerns.join(',')}&age=${analysisData.age}&gender=${analysisData.gender}`,
      config
    );

    dispatch({
      type: GET_RECOMMENDATIONS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: GET_RECOMMENDATIONS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// @desc    Reset face analysis state
export const resetFaceAnalysis = () => (dispatch) => {
  dispatch({ type: FACE_ANALYSIS_RESET });
};
