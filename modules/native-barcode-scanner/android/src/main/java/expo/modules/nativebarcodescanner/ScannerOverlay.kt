package expo.modules.nativebarcodescanner

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.ClipOp
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Full-screen scanner overlay rendered in Jetpack Compose.
 * Displays a dark mask with a transparent scan area, corner markers,
 * instruction text, close button, and flash toggle.
 */
@Composable
fun ScannerOverlay(
  isFlashOn: Boolean,
  onFlashToggle: () -> Unit,
  onClose: () -> Unit
) {
  val configuration = LocalConfiguration.current
  val screenWidthDp = configuration.screenWidthDp.dp
  val scanAreaSizeDp = screenWidthDp * 0.7f

  Box(modifier = Modifier.fillMaxSize()) {
    // Dark overlay with transparent cutout
    Canvas(modifier = Modifier.fillMaxSize()) {
      val scanAreaSizePx = scanAreaSizeDp.toPx()
      val left = (size.width - scanAreaSizePx) / 2f
      val top = (size.height - scanAreaSizePx) / 2f

      // Draw dark overlay with scan area cutout
      clipRect(
        left = left,
        top = top,
        right = left + scanAreaSizePx,
        bottom = top + scanAreaSizePx,
        clipOp = ClipOp.Difference
      ) {
        drawRect(color = Color.Black.copy(alpha = 0.6f))
      }

      // Draw corner markers
      drawCornerMarkers(
        left = left,
        top = top,
        size = scanAreaSizePx,
        cornerLength = 20.dp.toPx(),
        lineWidth = 3.dp.toPx()
      )
    }

    // Instruction text
    Column(
      modifier = Modifier.fillMaxSize(),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.Center
    ) {
      Spacer(modifier = Modifier.height(scanAreaSizeDp / 2 + 24.dp))
      Text(
        text = "Helyezze a vonalkódot a keretbe",
        color = Color.White,
        fontSize = 16.sp,
        textAlign = TextAlign.Center
      )
    }

    // Top control bar
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 20.dp)
        .padding(top = 60.dp),
      horizontalArrangement = Arrangement.SpaceBetween
    ) {
      // Close button
      Box(
        modifier = Modifier
          .size(44.dp)
          .clip(CircleShape)
          .background(Color.Black.copy(alpha = 0.5f))
          .clickable(onClick = onClose)
          .semantics { contentDescription = "Bezárás" },
        contentAlignment = Alignment.Center
      ) {
        Text(text = "✕", color = Color.White, fontSize = 20.sp)
      }

      // Flash toggle
      Box(
        modifier = Modifier
          .size(44.dp)
          .clip(CircleShape)
          .background(Color.Black.copy(alpha = 0.5f))
          .clickable(onClick = onFlashToggle)
          .semantics {
            contentDescription =
              if (isFlashOn) "Vaku kikapcsolása" else "Vaku bekapcsolása"
          },
        contentAlignment = Alignment.Center
      ) {
        Text(
          text = if (isFlashOn) "⚡" else "🔦",
          color = Color.White,
          fontSize = 20.sp
        )
      }
    }
  }
}

/**
 * Draws L-shaped corner markers around the scan area.
 */
private fun DrawScope.drawCornerMarkers(
  left: Float,
  top: Float,
  size: Float,
  cornerLength: Float,
  lineWidth: Float
) {
  val right = left + size
  val bottom = top + size
  val stroke = Stroke(width = lineWidth, cap = StrokeCap.Square)

  // Top-left corner
  drawLine(Color.White, Offset(left, top + cornerLength), Offset(left, top), strokeWidth = lineWidth)
  drawLine(Color.White, Offset(left, top), Offset(left + cornerLength, top), strokeWidth = lineWidth)

  // Top-right corner
  drawLine(Color.White, Offset(right - cornerLength, top), Offset(right, top), strokeWidth = lineWidth)
  drawLine(Color.White, Offset(right, top), Offset(right, top + cornerLength), strokeWidth = lineWidth)

  // Bottom-left corner
  drawLine(Color.White, Offset(left, bottom - cornerLength), Offset(left, bottom), strokeWidth = lineWidth)
  drawLine(Color.White, Offset(left, bottom), Offset(left + cornerLength, bottom), strokeWidth = lineWidth)

  // Bottom-right corner
  drawLine(Color.White, Offset(right - cornerLength, bottom), Offset(right, bottom), strokeWidth = lineWidth)
  drawLine(Color.White, Offset(right, bottom), Offset(right, bottom - cornerLength), strokeWidth = lineWidth)
}
