package ai.iflow.android.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class iFlowProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", iFlowCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", iFlowCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", iFlowCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", iFlowCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", iFlowCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", iFlowCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", iFlowCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", iFlowCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", iFlowCapability.Canvas.rawValue)
    assertEquals("camera", iFlowCapability.Camera.rawValue)
    assertEquals("screen", iFlowCapability.Screen.rawValue)
    assertEquals("voiceWake", iFlowCapability.VoiceWake.rawValue)
  }

  @Test
  fun screenCommandsUseStableStrings() {
    assertEquals("screen.record", iFlowScreenCommand.Record.rawValue)
  }
}
