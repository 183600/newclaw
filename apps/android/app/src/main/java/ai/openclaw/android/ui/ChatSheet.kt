package ai.newclaw.android.ui

import androidx.compose.runtime.Composable
import ai.newclaw.android.MainViewModel
import ai.newclaw.android.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
