import React from "react";
import { ActivityIndicator, StyleSheet, View, TouchableWithoutFeedback } from "react-native";
import { moderateScale } from "../../utils/scaling";
import { theme } from "../../constants";

export const loaderRef: any = React.createRef();
export function showLoader() {
  let ref: any = loaderRef.current;
  if (ref) {
    ref.showLoader();
  }
}
export function hideLoader() {
  let ref: any = loaderRef.current;
  if (ref) {
    ref.hideLoader();
  }
}
interface AppLoaderState {
  loader: boolean;
}

class AppLoader extends React.Component<{}, AppLoaderState> {
  constructor(props: any) {
    super(props);
    this.state = {
      loader: false,
    };
  }

  showLoader() {
    this.setState({
      loader: true,
    });
  }

  hideLoader() {
    setTimeout(() => {
      this.setState({
        loader: false,
      });
    }, 300);
  }

  render() {
    return (
      this.state.loader && (
          <View style={[styles.container, { height: "100%", width: "100%" }]}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  height: moderateScale(100),
                  width: moderateScale(100),
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "white",
                  borderRadius: moderateScale(10),
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <ActivityIndicator size="large" color={theme.colors.appleGreen} />
              </View>
            </TouchableWithoutFeedback>
          </View>
      )
    );
  }
}

export default AppLoader;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});
