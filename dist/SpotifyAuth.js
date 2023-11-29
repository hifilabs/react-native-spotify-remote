"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const ApiConfig_1 = require("./ApiConfig");
const ApiScope_1 = require("./ApiScope");
const SpotifyAuth = react_native_1.NativeModules.RNSpotifyRemoteAuth;
// Augment the iOS implementation of authorize to convert the Android style scopes
// to flags
if (react_native_1.Platform.OS === "ios") {
    const iosAuthorize = react_native_1.NativeModules.RNSpotifyRemoteAuth.authorize;
    SpotifyAuth.authorize = (config) => {
        const iosConfig = Object.assign(Object.assign(Object.assign({}, ApiConfig_1.API_CONFIG_DEFAULTS), config), { scopes: ApiScope_1.getiOSScopeFromScopes(config.scopes) });
        return iosAuthorize(iosConfig);
    };
}
if (react_native_1.Platform.OS === "android") {
    const androidAuthorize = react_native_1.NativeModules.RNSpotifyRemoteAuth.authorize;
    SpotifyAuth.authorize = (config) => {
        const mergedConfig = Object.assign(Object.assign({}, ApiConfig_1.API_CONFIG_DEFAULTS), config);
        return androidAuthorize(mergedConfig);
    };
}
// todo: remove in future release
// Here for backwards compatability
SpotifyAuth.initialize = async (config) => {
    const session = await SpotifyAuth.authorize(config);
    return session.accessToken;
};
exports.default = SpotifyAuth;
//# sourceMappingURL=SpotifyAuth.js.map