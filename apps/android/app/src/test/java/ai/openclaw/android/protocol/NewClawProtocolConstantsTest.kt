package ai.newclaw.android.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class NewClawProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", NewClawCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", NewClawCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", NewClawCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", NewClawCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", NewClawCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", NewClawCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", NewClawCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", NewClawCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", NewClawCapability.Canvas.rawValue)
    assertEquals("camera", NewClawCapability.Camera.rawValue)
    assertEquals("screen", NewClawCapability.Screen.rawValue)
    assertEquals("voiceWake", NewClawCapability.VoiceWake.rawValue)
  }

  @Test
  fun screenCommandsUseStableStrings() {
    assertEquals("screen.record", NewClawScreenCommand.Record.rawValue)
  }
}
