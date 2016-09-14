/*
 The MIT License (MIT)

 Copyright (c) 2014-2016 uFFFD

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software
 is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

"use strict";

let { Cu }= require('chrome');
Cu.import("resource://gre/modules/ctypes.jsm");

let postMessage;
let onerror;

let onmessage = function(event)
{
    try {
        switch (event.data) {
            case "attach":
                AttachEventListeners();
                break;
            case "detach":
                DetachEventListeners();
                break;
            case "debug":
                debugMode = true;
                break;
        }
    }
    catch (exception)
    {
        onerror(exception);
    }
};

/*
 This is the js module for meida key support on windows


 Usage:

 Components.utils.import("path/to/mk-win.js");
 var mkwin = new MKWin();
 mkwin.init(false);
 mkwin.unload();


 init():
 This will create a invisible window that waits for WM_APPCOMMAND and
 HSHELL_APPCOMMAND.

 When WM_APPCOMMAND or HSHELL_APPCOMMAND arrives and its lParam contains one of
 these APPCOMMAND_MEDIA_* values, a corresponding notify will be sent to all
 observers watching "mediakey" topic in Firefox:

 APPCOMMAND_MEDIA_NEXTTRACK      =>  next
 APPCOMMAND_MEDIA_PREVIOUSTRACK  =>  previous
 APPCOMMAND_MEDIA_STOP           =>  stop
 APPCOMMAND_MEDIA_PLAY_PAUSE     =>  play_pause


 unload():
 Destroy that invisible window and do some cleanups

 */

// https://developer.mozilla.org/en-US/docs/Mozilla/js-ctypes/js-ctypes_reference/ctypes
// http://msdn.microsoft.com/en-us/library/windows/desktop/aa383751.aspx
// http://msdn.microsoft.com/en-us/library/windows/desktop/aa384264.aspx
const WINAPI = ctypes.winapi_abi;
const CALLBACK = ctypes.stdcall_abi;

const BOOL = ctypes.bool;
const INT = ctypes.int;
const UINT = ctypes.unsigned_int;

const DWORD = ctypes.uint32_t;
const ATOM = ctypes.unsigned_short;

const UINT_PTR = ctypes.uintptr_t;
const LONG_PTR = ctypes.intptr_t;
const WPARAM = UINT_PTR;
const LPARAM = LONG_PTR;
const LRESULT = LONG_PTR;

const HANDLE = ctypes.voidptr_t;
const HBRUSH = HANDLE;
const HCURSOR = HANDLE;
const HICON = HANDLE;
const HINSTANCE = HANDLE;
const HMENU = HANDLE;
const HMODULE = HANDLE;
const HWND = HANDLE;

const LPVOID = ctypes.voidptr_t;

const LPWSTR = ctypes.jschar.ptr;

// http://msdn.microsoft.com/en-us/library/windows/desktop/ms632599.aspx#message_only
const HWND_MESSAGE = HWND(-3);

// http://msdn.microsoft.com/en-us/library/windows/desktop/ms632619.aspx
const WM_CREATE = 0x0001;
// http://msdn.microsoft.com/en-us/library/windows/desktop/ms632620.aspx
const WM_DESTROY = 0x0002;
// http://msdn.microsoft.com/en-us/library/windows/desktop/ms646275.aspx
const WM_APPCOMMAND = 0x0319;
const APPCOMMAND_MEDIA_NEXTTRACK = 11;
const APPCOMMAND_MEDIA_PREVIOUSTRACK = 12;
const APPCOMMAND_MEDIA_STOP = 13;
const APPCOMMAND_MEDIA_PLAY_PAUSE = 14;
// http://msdn.microsoft.com/en-us/library/windows/desktop/ms644991.aspx
const HSHELL_APPCOMMAND = 12;

//#define LOWORD(l)           ((WORD)(((DWORD_PTR)(l)) & 0xffff))
const LOWORD = function (l) {
    return l & 0xFFFF;
};

//#define HIWORD(l)           ((WORD)((((DWORD_PTR)(l)) >> 16) & 0xffff))
const HIWORD = function (l) {
    return (l >> 16) & 0xFFFF;
};

// http://msdn.microsoft.com/en-us/library/windows/desktop/ms646247.aspx
// #define GET_APPCOMMAND_LPARAM(lParam) ((short)(HIWORD(lParam) & ~FAPPCOMMAND_MASK))
const FAPPCOMMAND_MASK = 0xF000;
const GET_APPCOMMAND_LPARAM = function (lp) {
    return HIWORD(lp) & LOWORD(~FAPPCOMMAND_MASK >>> 0);
};

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633573.aspx
 LRESULT CALLBACK WindowProc(
 _In_  HWND hwnd,
 _In_  UINT uMsg,
 _In_  WPARAM wParam,
 _In_  LPARAM lParam
 );
 */
const WindowProcType = ctypes.FunctionType(CALLBACK, LRESULT, [HWND, UINT, WPARAM, LPARAM]);
const WindowProcTypePtr = WindowProcType.ptr;

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633576.aspx
 typedef struct tagWNDCLASSW {
 UINT      style;
 WNDPROC   lpfnWndProc;
 int       cbClsExtra;
 int       cbWndExtra;
 HINSTANCE hInstance;
 HICON     hIcon;
 HCURSOR   hCursor;
 HBRUSH    hbrBackground;
 LPCWSTR   lpszMenuName;
 LPCWSTR   lpszClassName;
 } WNDCLASSW, *PWNDCLASSW;
 */
const WNDCLASSW = ctypes.StructType("WNDCLASSW", [
    { "style": UINT },
    { "lpfnWndProc": WindowProcTypePtr },
    { "cbClsExtra": INT },
    { "cbWndExtra": INT },
    { "hInstance": HINSTANCE },
    { "hIcon": HICON },
    { "hCursor": HCURSOR },
    { "hbrBackground": HBRUSH },
    { "lpszMenuName": LPWSTR },
    { "lpszClassName": LPWSTR }
]);
const WNDCLASSW_PTR = WNDCLASSW.ptr;

var User32 = function() {
    let user32 = ctypes.open("user32.dll");

    /* http://msdn.microsoft.com/en-us/library/windows/desktop/ms644947.aspx
     UINT WINAPI RegisterWindowMessageW(
     _In_  LPCWSTR lpString
     );
     */
    user32.RegisterWindowMessageW = user32.declare("RegisterWindowMessageW", WINAPI, UINT, LPWSTR);

    /* http://msdn.microsoft.com/en-us/library/windows/desktop/ms644989.aspx
     BOOL WINAPI RegisterShellHookWindow(
     _In_  HWND hWnd
     );
     */
    user32.RegisterShellHookWindow = user32.declare("RegisterShellHookWindow", WINAPI, BOOL, HWND);

    /* http://msdn.microsoft.com/en-us/library/windows/desktop/ms644979.aspx
     BOOL WINAPI DeregisterShellHookWindow(
     _In_  HWND hWnd
     );
     */
    user32.DeregisterShellHookWindow = user32.declare("DeregisterShellHookWindow", WINAPI, BOOL, HWND);

    /* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633572.aspx
     LRESULT WINAPI DefWindowProcW(
     _In_  HWND hWnd,
     _In_  UINT Msg,
     _In_  WPARAM wParam,
     _In_  LPARAM lParam
     );
     */
    user32.DefWindowProcW = user32.declare("DefWindowProcW", WINAPI, LRESULT, HWND, UINT, WPARAM, LPARAM);

    /* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633586.aspx
     ATOM WINAPI RegisterClassW(
     _In_  const WNDCLASSW *lpWndClass
     );
     */
    user32.RegisterClassW = user32.declare("RegisterClassW", WINAPI, ATOM, WNDCLASSW_PTR);

    /* http://msdn.microsoft.com/en-us/library/windows/desktop/ms644899.aspx
     BOOL WINAPI UnregisterClassW(
     _In_      LPCWSTR lpClassName,
     _In_opt_  HINSTANCE hInstance
     );
     */
    user32.UnregisterClassW = user32.declare("UnregisterClassW", WINAPI, BOOL, LPWSTR, HINSTANCE);

    /* http://msdn.microsoft.com/en-us/library/windows/desktop/ms632680.aspx
     HWND WINAPI CreateWindowExW(
     _In_      DWORD dwExStyle,
     _In_opt_  LPCWSTR lpClassName,
     _In_opt_  LPCWSTR lpWindowName,
     _In_      DWORD dwStyle,
     _In_      int x,
     _In_      int y,
     _In_      int nWidth,
     _In_      int nHeight,
     _In_opt_  HWND hWndParent,
     _In_opt_  HMENU hMenu,
     _In_opt_  HINSTANCE hInstance,
     _In_opt_  LPVOID lpParam
     );
     */
    user32.CreateWindowExW = user32.declare("CreateWindowExW", WINAPI, HWND, DWORD, LPWSTR, LPWSTR, DWORD, INT, INT, INT, INT, HWND, HMENU, HINSTANCE, LPVOID);

    /* http://msdn.microsoft.com/en-us/library/windows/desktop/ms632682.aspx
     BOOL WINAPI DestroyWindow(
     _In_  HWND hWnd
     );
     */
    user32.DestroyWindow = user32.declare("DestroyWindow", WINAPI, BOOL, HWND);

    return user32;
};

function Kernel32() {
    let kernel = ctypes.open("kernel32.dll");

    /* http://msdn.microsoft.com/en-us/library/windows/desktop/ms683199.aspx
     HMODULE WINAPI GetModuleHandleW(
     _In_opt_  LPCWSTR lpModuleName
     );
     */
    kernel.GetModuleHandleW = kernel.declare("GetModuleHandleW", WINAPI, HMODULE, LPWSTR);
    return kernel;
}

// end of ctypes declarations

let lastKeyTimestamp = 0;
let WM_SHELLHOOKMESSAGE = 0;
let hInst;
const mediaKeyWinName = ctypes.jschar.array()("MediaKeyMsgOnlyWindow");
let wndProcCallback;
let mediaKeyWndClass;
let wndClassAtom = 0;
let msghwnd = HWND(0);
let debugMode = false;
let user32,kernel32;

const checkAppCmd = function (lp) {
    lp = ctypes.Int64.lo(lp);
    let cmd = GET_APPCOMMAND_LPARAM(lp);
    let keyname;
    switch (cmd) {
        case APPCOMMAND_MEDIA_NEXTTRACK:
            keyname = "MediaTrackNext";
            break;
        case APPCOMMAND_MEDIA_PREVIOUSTRACK:
            keyname = "MediaTrackPrevious";
            break;
        case APPCOMMAND_MEDIA_STOP:
            keyname = "MediaStop";
            break;
        case APPCOMMAND_MEDIA_PLAY_PAUSE:
            keyname = "MediaPlayPause";
            break;
        default:
            return false;
    }
    if (debugMode) {
        console.log("mediakey pressed: " + keyname);
    }
    postMessage({data: keyname});
    return true;
};

const windowProcJSCallback = function (hwnd, msg, wp, lp) { // LRESULT CALLBACK WindowProc(hwnd, msg, wp, lp)
    let ret;
    if (msg == WM_CREATE) {
        ret = user32.RegisterShellHookWindow(hwnd);
        if (debugMode) {
            console.log("RegisterShellHookWindow => " + ret);
        }
    }
    else if (msg == WM_DESTROY) {
        ret = user32.DeregisterShellHookWindow(hwnd);
        if (debugMode) {
            console.log("DeregisterShellHookWindow => " + ret);
        }
    }
    else if (msg == WM_APPCOMMAND) {
        if (checkAppCmd(lp)) {
            return LRESULT(1);
        }
    }
    else if (WM_SHELLHOOKMESSAGE != 0 && msg == WM_SHELLHOOKMESSAGE) {
        if (ctypes.UInt64.hi(wp) == 0 && ctypes.UInt64.lo(wp) == HSHELL_APPCOMMAND) {
            let now = Date.now();
            if (now - lastKeyTimestamp > 200) {
                lastKeyTimestamp = now;
                if (checkAppCmd(lp)) {
                    return LRESULT(1);
                }
            }
        }
    }
    return user32.DefWindowProcW(hwnd, msg, wp, lp);
};

var AttachEventListeners = function()
{
    kernel32 = new Kernel32();
    user32 = new User32();

    WM_SHELLHOOKMESSAGE = user32.RegisterWindowMessageW("SHELLHOOK");
    if (debugMode) {
        console.log("RegisterWindowMessageW => " + WM_SHELLHOOKMESSAGE);
    }

    hInst = kernel32.GetModuleHandleW(ctypes.cast(LPVOID(0), LPWSTR));

    // https://developer.mozilla.org/en-US/docs/Mozilla/js-ctypes/js-ctypes_reference/Callbacks
    // Warning: You must store a reference to the callback object as long as the native code might
    //   call it. If you don't, the GC might collect the relevant data structures, and the browser
    //   will crash when native code attempts to invoke your callback.
    wndProcCallback = WindowProcTypePtr(windowProcJSCallback);

    mediaKeyWndClass = WNDCLASSW();
    mediaKeyWndClass.lpszClassName = mediaKeyWinName;
    mediaKeyWndClass.lpfnWndProc = wndProcCallback;
    mediaKeyWndClass.hInstance = hInst;
    wndClassAtom = user32.RegisterClassW(mediaKeyWndClass.address());
    if (debugMode) {
        console.log("RegisterClassW => " + wndClassAtom);
    }

    msghwnd = user32.CreateWindowExW(0, // dwExStyle
        mediaKeyWinName, // lpClassName
        mediaKeyWinName, // lpWindowName
        0, // dwStyle
        0, 0, 0, 0, // x, y, width, height
        HWND_MESSAGE, // hWndParent
        HMENU(0), // hMenu
        hInst, // hInstance
        LPVOID(0) // lpParam
    );
    if (debugMode) {
        console.log("CreateWindowExW => " + (msghwnd.toString() != HWND(0).toString()));
    }
};

var DetachEventListeners = function()
{
    let ret;
    if (msghwnd.toString() != HWND(0).toString()) {
        ret = user32.DestroyWindow(msghwnd);
        if (debugMode) {
            console.log("DestroyWindow => " + ret);
        }
    }
    if (wndClassAtom != 0) {
        wndClassAtom = 0;
        ret = user32.UnregisterClassW(mediaKeyWinName, hInst);
        if (debugMode) {
            console.log("UnregisterClassW => " + ret);
        }
    }
    if (debugMode) console.log("closing user32");
    user32.close();
    mediaKeyWndClass = null;
    wndProcCallback = null;
    user32 = null;
    WM_SHELLHOOKMESSAGE = 0;
    hInst = null;
    msghwnd = HWND(0);

    if (debugMode) console.log("closing kernel32");
    kernel32.close();
    kernel32 = null;
};

var addEventListener = function(eventHandler)
{
    postMessage = eventHandler;
};

var removeEventListener = function(eventHandler)
{
    postMessage = null;
};

exports.postMessage = function(data){
    onmessage({data: data});
};
exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;

Object.defineProperty(exports, "onerror", { set: function (errorHandler){ onerror = errorHandler; }});