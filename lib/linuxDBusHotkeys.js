/*jshint moz: true, undef: true, unused: true */
/*global ctypes, require, console, exports */

let { Cu }= require('chrome');
Cu.import("resource://gre/modules/ctypes.jsm");

var EmitEvent;

const gpointer = ctypes.voidptr_t;
const gulong = ctypes.unsigned_long;
const guint = ctypes.unsigned_int;
const guint32 = ctypes.uint32_t;
//const guint16 = ctypes.uint16_t;
const gint = ctypes.int;
//const gint8 = ctypes.int8_t;
//const gint16 = ctypes.int16_t;
const gchar = ctypes.char;
//const guchar = ctypes.unsigned_char;
//const gboolean = gint;
//const gfloat = ctypes.float;
//const gdouble = ctypes.double;
const gsize = ctypes.unsigned_long;
const GCallback = ctypes.voidptr_t;
const GClosureNotify = gpointer;
//const GFunc = ctypes.void_t.ptr;
//const GList = ctypes.StructType("GList");
const GConnectFlags = guint; // enum
//const G_CONNECT_AFTER   = 1 << 0;
//const G_CONNECT_SWAPPED = 1 << 1;

//const GCallback_t = ctypes.FunctionType(
    //ctypes.default_abi, ctypes.void_t, [gpointer]).ptr;
//const GClosure = ctypes.StructType("GClosure", [
    //{ in_marshal: guint },
    //{ is_invalid: guint },
//]);

const GCancellable = ctypes.StructType("GCancellable");
const GQuark = guint32;
const GError = ctypes.StructType("GError", [
    { domain: GQuark },
    { code: gint },
    { message: gchar.ptr }
]);

const GDBusProxy = ctypes.StructType('GDBusProxy');
const GDBusInterfaceInfo = ctypes.StructType('GDBusInterfaceInfo');

const GVariant = ctypes.StructType("GVariant");
//const GVariantType = gchar;

const GObject = ctypes.StructType("GObject");
const GAsyncResult = ctypes.StructType("GAsyncResult");
const GAsyncReadyCallback = ctypes.FunctionType(
    ctypes.default_abi,
    ctypes.void_t,
    [GObject.ptr, GAsyncResult.ptr, gpointer]).ptr;

const GDBusProxyFlags = ctypes.int; // enum
const G_DBUS_PROXY_FLAGS_NONE = 0;
//const G_DBUS_PROXY_FLAGS_DO_NOT_LOAD_PROPERTIES = (1<<0);
//const G_DBUS_PROXY_FLAGS_DO_NOT_CONNECT_SIGNALS = (1<<1);
//const G_DBUS_PROXY_FLAGS_DO_NOT_AUTO_START      = (1<<2);

const GBusType = ctypes.int; // enum
//const G_BUS_TYPE_STARTER = -1;
//const G_BUS_TYPE_NONE = 0;
//const G_BUS_TYPE_SYSTEM  = 1;
const G_BUS_TYPE_SESSION = 2;

const GDBusCallFlags = ctypes.int; // enum
//const G_DBUS_CALL_FLAGS_NONE = 0;
const G_DBUS_CALL_FLAGS_NO_AUTO_START = (1<<0);

// Javascript equivalent of G_CALLBACK macro
function G_CALLBACK(f)
{
    return ctypes.cast(f, GCallback);
}

function toCharArray(str)
{
    return gchar.array()(str);
}


// Libraries and functions
var gLibsExist = false;
var glib;
var gobject;
var gio;
var g_free;
var g_object_unref;
var g_signal_connect_data;
var g_dbus_proxy_new_for_bus_sync;
var g_dbus_proxy_call;
var g_variant_new;
var g_variant_get_child_value;
var g_variant_get_string;
var g_variant_unref;
var onSignalDeclaration;

// References
var dbus_proxy = null; //GDBusProxy
var error = null; //GError

// These libraries might not be available on all systems.
try {
    // Garbage collector is responsible for closing these libraries if they exist.
    glib = ctypes.open("libglib-2.0.so.0");
    gobject = ctypes.open("libgobject-2.0.so.0");
    gio = ctypes.open("libgio-2.0.so.0");
    gLibsExist = true;
} catch (ex) {}

if (gLibsExist) {
    g_free = glib.declare(
        "g_free",
        ctypes.default_abi,
        ctypes.void_t,
        gpointer
    );
    g_object_unref = gobject.declare(
        "g_object_unref",
        ctypes.default_abi,
        ctypes.void_t,
        gpointer
    );
    onSignalDeclaration = ctypes.FunctionType(
        ctypes.default_abi,
        ctypes.void_t, //return
        [GDBusProxy.ptr, //proxy
         gchar.ptr, //sender_name
         gchar.ptr, //signal_name
         GVariant.ptr, //parameters
         gpointer //user_data
        ]
    );
    // Can't use g_signal_connect because it's #define
    g_signal_connect_data = gobject.declare(
        'g_signal_connect_data',
        ctypes.default_abi,
        gulong, // return status
        gpointer, //instance
        gchar.ptr, //detailed_signal
        GCallback, //c_handler
        gpointer, //data to pass handler,
        GClosureNotify, //destory_data
        GConnectFlags //connect_flags
    );
    g_dbus_proxy_new_for_bus_sync = gio.declare(
        'g_dbus_proxy_new_for_bus_sync',
        ctypes.default_abi,
        GDBusProxy.ptr, //return
        GBusType, //bus_type
        GDBusProxyFlags, //flags
        GDBusInterfaceInfo.ptr, //info
        gchar.ptr, //name
        gchar.ptr, //object_path
        gchar.ptr, //interface_name
        GCancellable.ptr, //cancellable
        GError.ptr.ptr //error
    );
    g_dbus_proxy_call = gio.declare(
        'g_dbus_proxy_call',
        ctypes.default_abi,
        ctypes.void_t, //return
        GDBusProxy.ptr, //proxy
        gchar.ptr, //method_name
        GVariant.ptr, //parameters
        GDBusCallFlags, //flags
        gint, //timeout_msec
        GCancellable.ptr, //cancellable
        GAsyncReadyCallback, //callback
        gpointer //user_data
    );
    g_variant_new = glib.declare(
        "g_variant_new",
        ctypes.default_abi,
        GVariant.ptr, //return
        gchar.ptr, //format_string
        "..." //varagsj
    );
    //g_variant_print = glib.declare(
        //"g_variant_print",
        //ctypes.default_abi,
        //gchar.ptr, //return
        //GVariant.ptr, //value
        //gboolean //type_annotate
    //);
    g_variant_get_child_value = glib.declare(
        "g_variant_get_child_value",
        ctypes.default_abi,
        GVariant.ptr, //return
        GVariant.ptr, //value,
        gsize //index_
    );
    g_variant_get_string = glib.declare(
        "g_variant_get_string",
        ctypes.default_abi,
        gchar.ptr, //return
        GVariant.ptr, //value,
        gsize.ptr //length
    );
    g_variant_unref = glib.declare(
        "g_variant_unref",
        ctypes.default_abi,
        ctypes.void_t, //return
        GVariant.ptr //value,
    );
}

// Worker message listener
var postMessage = function(message)
{
    switch (message)
    {
        case "attach":
            AttachEventListeners();
            break;
        case "detach":
            DetachEventListeners();
            break;
        default:
            console.log("Received invalid 'message': " + message);
    }
};

var on_signal = function(proxy, sender_name, signal_name, parameters, user_data)
{
    // parameters is a 2-element GVariant array eg ('FirefoxMediaKeys', 'Play')
    // so get the 2nd element which is the message value
    var tmp = g_variant_get_child_value(parameters, 1);
    var value = g_variant_get_string(tmp, null).readString();

    if (value == "Next")
    {
        EmitEvent({data: "MediaTrackNext"});
    }
    else if (value == "Previous")
    {
        EmitEvent({data: "MediaTrackPrevious"});
    }
    else if (value == "Stop")
    {
        EmitEvent({data: "MediaStop"});
    }
    else if (value == "Play")
    {
        EmitEvent({data: "MediaPlayPause"});
    }
    else if (value == "Pause")
    {
        EmitEvent({data: "MediaPause"});
    }
    g_variant_unref(tmp);
    return;
};
var callback = G_CALLBACK(onSignalDeclaration.ptr(on_signal));

var AttachEventListeners = function()
{
    dbus_proxy = g_dbus_proxy_new_for_bus_sync(
        G_BUS_TYPE_SESSION,
        G_DBUS_PROXY_FLAGS_NONE,
        null, //GDBusInterfaceInfo
        "org.gnome.SettingsDaemon",
        "/org/gnome/SettingsDaemon/MediaKeys",
        "org.gnome.SettingsDaemon.MediaKeys",
        null, //GCancellable
        error
    );

    // Connect JS callback to C DBus listener
    g_signal_connect_data(
        dbus_proxy,
        "g-signal",
        callback,
        null,
        null,
        0
    );

    // Ask settings daemon to grab media keys for this application
    g_dbus_proxy_call(
        dbus_proxy,
        "GrabMediaPlayerKeys",
        g_variant_new(toCharArray("(su)"),
                      toCharArray("FirefoxMediaKeys"),
                      gint(0)),
        G_DBUS_CALL_FLAGS_NO_AUTO_START,
        -1,
        null,
        null,
        null
    );

    console.log('attached listeners');
};

var DetachEventListeners = function()
{
    console.log('Detaching DBus listeners');

    g_dbus_proxy_call(
        dbus_proxy,
        "ReleaseMediaPlayerKeys",
        g_variant_new(toCharArray("(s)"),
                      toCharArray("FirefoxMediaKeys")),
        G_DBUS_CALL_FLAGS_NO_AUTO_START,
        -1,
        null,
        null,
        null
    );

    if (dbus_proxy) {
        g_object_unref(dbus_proxy);
    }

    console.log('Detached DBus listeners');
};

var addEventListener = function(eventHandler)
{
    EmitEvent = eventHandler;
};

var removeEventListener = function(eventHandler)
{
    EmitEvent = null;
};

exports.gLibsExist = gLibsExist;
exports.postMessage = postMessage;
exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;

