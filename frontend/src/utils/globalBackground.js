// Global state for "apply to all slides" background
let globalBackgroundState = {
  isActive: false,
  background: null,
  toggleState: false // Persist toggle state across component remounts
};

export const getGlobalBackground = () => globalBackgroundState;

export const setGlobalBackground = (state) => {
  globalBackgroundState = { ...globalBackgroundState, ...state };
};

export const getToggleState = () => globalBackgroundState.toggleState;

export const setToggleState = (state) => {
  globalBackgroundState.toggleState = state;
  // Also update isActive to match toggle state
  if (!state) {
    globalBackgroundState.isActive = false;
    globalBackgroundState.background = null;
  }
};

