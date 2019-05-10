/* tslint:disable */

/**
 * NMActiveConnectionState values indicate the state of a connection to a specific network while it is starting, connected, or disconnecting from that network.
 * https://developer.gnome.org/NetworkManager/stable/nm-dbus-types.html#NMActiveConnectionState
 */

export enum NM_STATE {
  UNKNOWN = 0, //Networking state is unknown.This indicates a daemon error that makes it unable to reasonably assess the state. In such event the applications are expected to assume Internet connectivity might be present and not disable controls that require network access.The graphical shells may hide the network accessibility indicator altogether since no meaningful status indication can be provided.
  ASLEEP = 10, //Networking is not enabled, the system is being suspended or resumed from suspend.
  DISCONNECTED = 20, //There is no active network connection.The graphical shell should indicate no network connectivity and the applications should not attempt to access the network.
  DISCONNECTING = 30, //Network connections are being cleaned up.The applications should tear down their network sessions.
  CONNECTING = 40, //A network connection is being started The graphical shell should indicate the network is being connected while the applications should still make no attempts to connect the network.
  CONNECTED_LOCAL = 50, //There is only local IPv4 and/ or IPv6 connectivity, but no default route to access the Internet.The graphical shell should indicate no network connectivity.
  CONNECTED_SITE = 60, //There is only site- wide IPv4 and/ or IPv6 connectivity.This means a default route is available, but the Internet connectivity check (see "Connectivity" property) did not succeed. The graphical shell should indicate limited network connectivity.
  CONNECTED_GLOBAL = 70 // There is global IPv4 and/or IPv6 Internet connectivity This means the Internet connectivity check succeeded, the graphical shell should indicate full network connectivity.
}
