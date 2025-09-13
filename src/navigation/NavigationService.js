import { CommonActions } from '@react-navigation/native';

let _navigator = null;

const setNavigator = navigatorRef => {
  _navigator = navigatorRef;
};

const navigate = (routeName, params) => {
  if (_navigator) {
    _navigator.dispatch(
      CommonActions.navigate({
        name: routeName,
        params,
      }),
    );
  }
};

const resetRoot = (routeName, params = {}) => {
  if (_navigator) {
    _navigator.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName, params }],
      }),
    );
  }
};

export default {
  setNavigator,
  navigate,
  resetRoot,
};
