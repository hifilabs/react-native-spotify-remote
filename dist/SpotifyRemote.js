"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const GetChildrenItemsOptions_1 = require("./GetChildrenItemsOptions");
const nativeModule = react_native_1.NativeModules.RNSpotifyRemoteAppRemote;
const nativeEventEmitter = new react_native_1.NativeEventEmitter(nativeModule);
const eventListeners = {
    playerContextChanged: new Set(),
    playerStateChanged: new Set(),
    remoteConnected: new Set(),
    remoteDisconnected: new Set(),
};
const SpotifyRemote = {
    // Native APIs
    connect: nativeModule.connect.bind(nativeModule),
    disconnect: nativeModule.disconnect.bind(nativeModule),
    getChildrenOfItem: nativeModule.getChildrenOfItem.bind(nativeModule),
    getContentItemForUri: nativeModule.getContentItemForUri.bind(nativeModule),
    getCrossfadeState: nativeModule.getCrossfadeState.bind(nativeModule),
    getPlayerState: nativeModule.getPlayerState.bind(nativeModule),
    getRecommendedContentItems: nativeModule.getRecommendedContentItems.bind(nativeModule),
    getRootContentItems: nativeModule.getRootContentItems.bind(nativeModule),
    isConnectedAsync: nativeModule.isConnectedAsync.bind(nativeModule),
    pause: nativeModule.pause.bind(nativeModule),
    playItem: nativeModule.playItem.bind(nativeModule),
    playItemWithIndex: nativeModule.playItemWithIndex.bind(nativeModule),
    playUri: nativeModule.playUri.bind(nativeModule),
    queueUri: nativeModule.queueUri.bind(nativeModule),
    resume: nativeModule.resume.bind(nativeModule),
    seek: nativeModule.seek.bind(nativeModule),
    setRepeatMode: nativeModule.setRepeatMode.bind(nativeModule),
    setShuffling: nativeModule.setShuffling.bind(nativeModule),
    skipToNext: nativeModule.skipToNext.bind(nativeModule),
    skipToPrevious: nativeModule.skipToPrevious.bind(nativeModule),
    setPlaying(playing) {
        // todo: Will want to likely check the state of playing somewhere?
        // Perhaps this can be done in native land so that we don't need to
        // worry about it here
        return playing ? this.resume() : this.pause();
    },
    // Listeners
    addListener(eventType, listener) {
        const sub = nativeEventEmitter.addListener(eventType, listener);
        if (this.listenerCount(eventType) === 0) {
            nativeModule.eventStartObserving(eventType);
        }
        eventListeners[eventType].add(sub);
        const _remove = sub.remove;
        // rewrite sub.remove so we can add stopObserving API
        sub.remove = () => {
            _remove.call(sub);
            eventListeners[eventType].delete(sub);
            if (this.listenerCount(eventType) === 0) {
                nativeModule.eventStopObserving(eventType);
            }
        };
        return sub;
    },
    removeListener(eventType, listener) {
        eventListeners[eventType].forEach((eventListener) => {
            if (eventListener.listener === listener)
                eventListener.remove();
        });
    },
    removeAllListeners(eventType) {
        const eventsToRemove = eventType ? [eventType] : this.eventNames();
        for (const eventToRemove of eventsToRemove) {
            eventListeners[eventToRemove].forEach((eventListener) => {
                eventListener.remove();
            });
        }
    },
    emit(eventType, ...args) {
        return nativeEventEmitter.emit(eventType, ...args);
    },
    listenerCount(eventType) {
        return eventListeners[eventType].size;
    },
    on(...args) {
        return this.addListener(...args);
    },
    off(...args) {
        return this.removeListener(...args);
    },
    eventNames() {
        return [
            'playerContextChanged',
            'playerStateChanged',
            'remoteConnected',
            'remoteDisconnected',
        ];
    },
};
// Augment the android module to warn on unimplemented methods
if (react_native_1.Platform.OS === "android") {
    SpotifyRemote.getContentItemForUri = async (uri) => {
        console.warn("getContentItemForUri is not implemented in Spotify's Android SDK");
        return undefined;
    };
    SpotifyRemote.getRootContentItems = async (type) => {
        console.warn("getRootContentItems is not implemented in Spotify's Android SDK");
        return [];
    };
    const androidGetItemOfChildren = SpotifyRemote.getChildrenOfItem;
    SpotifyRemote.getChildrenOfItem = async (item, options) => {
        return androidGetItemOfChildren(item, Object.assign(Object.assign({}, GetChildrenItemsOptions_1.DEFAULT_GET_CHILDREN_OPTIONS), options));
    };
}
// Augment the iOS module to handle differences
if (react_native_1.Platform.OS === "ios") {
    const iosGetChildrenOfItem = SpotifyRemote.getChildrenOfItem;
    SpotifyRemote.getChildrenOfItem = async (item, options) => {
        return iosGetChildrenOfItem(item);
    };
}
exports.default = SpotifyRemote;
//# sourceMappingURL=SpotifyRemote.js.map