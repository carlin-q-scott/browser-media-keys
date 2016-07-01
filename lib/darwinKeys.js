/*jshint moz: true, undef: true, unused: true */
/*global ctypes, require, console, exports */

let { Cu } = require('chrome');

Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));

var is64bit = ctypes.voidptr_t.size == 4 ? false : true;

// BASIC TYPES
const
	char = ctypes.char,
	id = ctypes.voidptr_t,
	IMP = ctypes.voidptr_t,
	SEL = ctypes.voidptr_t,
	Class = ctypes.voidptr_t,
	NSUInteger = is64bit ? ctypes.unsigned_long : ctypes.unsigned_int,
	NSInteger = is64bit ? ctypes.long: ctypes.int,
	BOOL = ctypes.signed_char,
	NSEvent = ctypes.voidptr_t,
	UInt16 = ctypes.uint16_t,
    NSEventType = NSUInteger,
	NSEventMask = NSUInteger,
	EventMonitorCallback = ctypes.FunctionType(ctypes.default_abi, NSEvent.ptr, [id, NSEvent.ptr]);

// CONSTANTS
// event magic numbers from https://github.com/shannah/codenameone-avian/blob/84e2a17e99d2ff7db1da4246e833edb84e86f0f0/jdk7u-dev/build/macosx-x86_64/bridge_metadata/AppKit.headers/NSEvent.h#L79
const 
	NSLeftMouseDown = 1,				// NSEventType
	NSLeftMouseUp = 2,				// NSEventType
	NSRightMouseDown = 3,			// NSEventType
	NSRightMouseUp = 4,				// NSEventType
	NSMouseMoved = 5,				// NSEventType
	NSLeftMouseDragged = 6,			// NSEventType
	NSRightMouseDragged = 7,			// NSEventType
	NSMouseEntered = 8,				// NSEventType
	NSMouseExited = 9,				// NSEventType
	NSKeyDown = 10,					// NSEventType
	NSKeyUp = 11,					// NSEventType
	NSFlagsChanged = 12,				// NSEventType
	NSAppKitDefined = 13,			// NSEventType
	NSSystemDefined = 14,			// NSEventType
	NSApplicationDefined = 15,		// NSEventType
	NSPeriodic = 16,					// NSEventType
	NSCursorUpdate = 17,				// NSEventType
	NSScrollWheel = 22,				// NSEventType
	NSTabletPoint = 23,				// NSEventType
	NSTabletProximity = 24,			// NSEventType
	NSOtherMouseDown = 25,			// NSEventType
	NSOtherMouseUp = 26,				// NSEventType
	NSOtherMouseDragged = 27,		// NSEventType
	NSEventTypeGesture = 29,			// NSEventType
	NSEventTypeMagnify = 30,			// NSEventType
	NSEventTypeSwipe = 31,			// NSEventType
	NSEventTypeRotate = 18,			// NSEventType
	NSEventTypeBeginGesture = 19,	// NSEventType
	NSEventTypeEndGesture = 20,		// NSEventType
	NSEventTypeSmartMagnify = 32,	// NSEventType
	NSEventTypeQuickLook = 33,		// NSEventType
	NSEventTypePressure = 34,		// NSEventType
	NSUIntegerMax = NSUInteger(is64bit ? '0xffffffff' : '0xffff'),		// NSUInteger
    
    //hidsystem/ev_keymap.h
    NX_KEYTYPE_SOUND_UP = 0,
    NX_KEYTYPE_SOUND_DOWN = 1,
    NX_KEYTYPE_PLAY_PAUSE = 16,
    NX_KEYTYPE_NEXT = 17,
    NX_KEYTYPE_PREVIOUS = 18,
    NX_KEYTYPE_FAST = 19,
    NX_KEYTYPE_REWIND = 20,

	nil = ctypes.cast(NSInteger(0), ctypes.voidptr_t)

// the NSEventMask stuff is wrong in docs, the docs say here: https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ApplicationKit/Classes/NSEvent_Class/index.html#//apple_ref/doc/constant_group/NSEventMaskFromType
	// the actual source code says here: /System/Library/Frameworks/AppKit.framework/Versions/C/Headers/NSEvent.h   pasted the part here thanks to @arai - https://gist.github.com/Noitidart/9470ec02bd252e2ae7eb
	// see chat with @arai and @capella on Aug 29 2015
const
    NSLeftMouseDownMask = 1 << NSLeftMouseDown,
    NSLeftMouseUpMask = 1 << NSLeftMouseUp,
    NSRightMouseDownMask = 1 << NSRightMouseDown,
    NSRightMouseUpMask = 1 << NSRightMouseUp,
    NSMouseMovedMask = 1 << NSMouseMoved,
    NSLeftMouseDraggedMask = 1 << NSLeftMouseDragged,
    NSRightMouseDraggedMask = 1 << NSRightMouseDragged,
    NSMouseEnteredMask = 1 << NSMouseEntered,
    NSMouseExitedMask = 1 << NSMouseExited,
    NSKeyDownMask = 1 << NSKeyDown,
    NSKeyUpMask = 1 << NSKeyUp,
    NSFlagsChangedMask = 1 << NSFlagsChanged,
    NSAppKitDefinedMask = 1 << NSAppKitDefined,
    NSSystemDefinedMask = 1 << NSSystemDefined,
    NSApplicationDefinedMask = 1 << NSApplicationDefined,
    NSPeriodicMask = 1 << NSPeriodic,
    NSCursorUpdateMask = 1 << NSCursorUpdate,
    NSScrollWheelMask = 1 << NSScrollWheel,
    NSTabletPointMask = 1 << NSTabletPoint,
    NSTabletProximityMask = 1 << NSTabletProximity,
    NSOtherMouseDownMask = 1 << NSOtherMouseDown,
    NSOtherMouseUpMask = 1 << NSOtherMouseUp,
    NSOtherMouseDraggedMask = 1 << NSOtherMouseDragged,
    NSEventMaskGesture = 1 << NSEventTypeGesture,
    NSEventMaskMagnify = 1 << NSEventTypeMagnify,
    NSEventMaskSwipe = 1 << NSEventTypeSwipe,	// 1U << NSEventTypeSwipe
    NSEventMaskRotate = 1 << NSEventTypeRotate,
    NSEventMaskBeginGesture = 1 << NSEventTypeBeginGesture,
    NSEventMaskEndGesture = 1 << NSEventTypeEndGesture,
    NSEventMaskSmartMagnify = 1 << NSEventTypeSmartMagnify,	// 1ULL << NSEventTypeSmartMagnify,
    NSEventMaskPressure = 1 << NSEventTypePressure,	// 1ULL << NSEventTypePressure
    NSAnyEventMask = NSUIntegerMax; //0xffffffffU

// COMMON FUNCTIONS
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, char.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, char.ptr);

// COMMON SELECTORS
var release = sel_registerName('release');

// OBJC HELPERS
function createBlock(aFuncTypePtr) {
	/**
	 * Creates a C block instance from a JS Function.
	 * Blocks are regular Objective-C objects in Obj-C, and can be sent messages;
	 * thus Block instances need are creted using the core.wrapId() function.
	 */
	// Apple Docs :: Working with blocks - https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/WorkingwithBlocks/WorkingwithBlocks.html

	var _NSConcreteGlobalBlock = objc.declare('_NSConcreteGlobalBlock', ctypes.voidptr_t); // https://dxr.mozilla.org/mozilla-central/source/js/src/ctypes/Library.cpp?offset=0#271
	
	/**
	 * The "block descriptor" is a static singleton struct. Probably used in more
	 * complex Block scenarios involving actual closure variables needing storage
	 * (in `NodObjC`, JavaScript closures are leveraged instead).
	 */
	// struct is seen here in docs: http://clang.llvm.org/docs/Block-ABI-Apple.html
	var Block_descriptor_1 = ctypes.StructType('Block_descriptor_1', [
		{ reserved: ctypes.unsigned_long_long },
		{ size: ctypes.unsigned_long_long }
	]);
	
	/**
	 * We have to simulate what the llvm compiler does when it encounters a Block
	 * literal expression (see `Block-ABI-Apple.txt` above).
	 * The "block literal" is the struct type for each Block instance.
	 */
	// struct is seen here in docs: http://clang.llvm.org/docs/Block-ABI-Apple.html
	var Block_literal_1 = ctypes.StructType('Block_literal_1', [
		{ isa: ctypes.voidptr_t },
		{ flags: ctypes.int32_t },
		{ reserved: ctypes.int32_t },
		{ invoke: ctypes.voidptr_t },
		{ descriptor: Block_descriptor_1.ptr }
	]);
	
	const
		BLOCK_HAS_COPY_DISPOSE = 1 << 25,
		BLOCK_HAS_CTOR = 1 << 26,
		BLOCK_IS_GLOBAL = 1 << 28,
		BLOCK_HAS_STRET = 1 << 29,
		BLOCK_HAS_SIGNATURE = 1 << 30
	
	// based on work from here: https://github.com/trueinteractions/tint2/blob/f6ce18b16ada165b98b07869314dad1d7bee0252/modules/Bridge/core.js#L370-L394
	var bl = Block_literal_1();
	// Set the class of the instance
	bl.isa = _NSConcreteGlobalBlock;
	// Global flags
	bl.flags = BLOCK_HAS_STRET;
	bl.reserved = 0;
	bl.invoke = aFuncTypePtr;
	
	// create descriptor
	var desc = Block_descriptor_1();
	desc.reserved = 0;
	desc.size = Block_literal_1.size;
	
	// set descriptor into block literal
	bl.descriptor = desc.address();

	return bl;
}

// my personal globals for this code
var releaseThese = [];

function shutdown() {
	//put code here to unswizzle it
	for (var i=0; i<releaseThese.length; i++) {
		objc_msgSend(releaseThese[i], release);
	}
	objc.close();
};

var NSEvent_c = objc_getClass('NSEvent');
var addMonitorForEventsMatchingMask = sel_registerName('addLocalMonitorForEventsMatchingMask:handler:');
var subtype = sel_registerName('subtype');
var data1 = sel_registerName('data1');
var EmitEvent;

function SystemEventHandler(self, event_ptr) 
{
    //console.log('in myHandler', event_ptr);
    try
    {
        var eventSubType = objc_msgSend(event_ptr, subtype);
        //console.info('event type:', eventSubType);
        eventSubType = ctypes.cast(eventSubType, NSUInteger).value;
        //console.info('event type:', eventSubType.toString());
        
        if (eventSubType == 8)
        {
            var eventData = objc_msgSend(event_ptr, data1);
            //console.info('event data:', eventData);
            eventData = ctypes.cast(eventData, NSUInteger).value;
            //console.info('event data:', eventData.toString());

            var keyUp = eventData & 0x0100;
            //console.info('key state:', keyUp ? 'up' : 'down');

            var keyRepeat = !!(eventData & 0x1);
            //console.info('key repeat:', keyRepeat)

            var keyCode = eventData >>> 16;
            //console.info('key code:', keyCode);
            switch (keyCode)
            {
                case NX_KEYTYPE_PLAY_PAUSE:
                    if (keyUp || keyRepeat) return null;
                    EmitEvent("MediaPlayPause");
                    return null;
                case NX_KEYTYPE_NEXT:
                case NX_KEYTYPE_FAST:
                    if (keyUp || keyRepeat) return null;
                    EmitEvent("MediaTrackNext");
                    return null;
                case NX_KEYTYPE_PREVIOUS:
                case NX_KEYTYPE_REWIND:
                    if (keyUp || keyRepeat) return null;
                    EmitEvent("MediaTrackPrevious");
                    return null;
            }
        }
    } 
    catch (exception)
    {
        console.error(exception);
    }
        
    return event_ptr; // return null to block
};

var SystemEventHandler_c;
var SystemEventHandlerBlock_c;
var rez_add;

function AttachEventListeners()
{	
    SystemEventHandler_c = EventMonitorCallback.ptr(SystemEventHandler);
    SystemEventHandlerBlock_c = createBlock(SystemEventHandler_c);
	//console.info('myBlock_c:', SystemEventHandlerBlock_c);
	//console.info('myBlock_c.address():', SystemEventHandlerBlock_c.address());
	
	rez_add = objc_msgSend(NSEvent_c, addMonitorForEventsMatchingMask, NSEventMask(NSSystemDefinedMask), SystemEventHandlerBlock_c.address());
	//console.log('rez_add:', rez_add);
}

function DetachEventListeners()
{
    var removeMonitor = sel_registerName('removeMonitor:');
    var rez_remove = objc_msgSend(NSEvent_c, removeMonitor, rez_add);
    //console.log('rez_remove:', rez_remove, rez_remove.toString());
    
    SystemEventHandler_c = null;
    SystemEventHandlerBlock_c = null;
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

var addEventListener = function(eventHandler)
{
    EmitEvent = function (eventData) {
        eventHandler({ data: eventData });
    };
};

var removeEventListener = function(eventHandler)
{
    EmitEvent = null;
};

exports.postMessage = postMessage;
exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;