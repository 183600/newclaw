package ai.iflow.android.ui

import androidx.compose.runtime.Composable
import ai.iflow.android.MainViewModel
import ai.iflow.android.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
