import SwiftUI

/// Observable state shared between the native view and SwiftUI overlay.
class ScannerOverlayState: ObservableObject {
  @Published var isFlashOn: Bool = false
}

/// Full-screen scanner overlay rendered in SwiftUI.
/// Displays a dark mask with a transparent scan area, corner markers,
/// instruction text, close button, and flash toggle.
struct ScannerOverlayView: View {
  @ObservedObject var state: ScannerOverlayState
  var onClose: () -> Void
  var onFlashToggle: () -> Void

  var body: some View {
    GeometryReader { geometry in
      let scanAreaSize = geometry.size.width * 0.7
      let centerY = geometry.size.height / 2
      let centerX = geometry.size.width / 2

      ZStack {
        // Dark overlay with transparent cutout for scan area
        ScanAreaMask(
          scanAreaSize: scanAreaSize,
          center: CGPoint(x: centerX, y: centerY)
        )
        .fill(style: FillStyle(eoFill: true))
        .foregroundColor(Color.black.opacity(0.6))

        // Corner markers around the scan area
        CornerMarkers(size: scanAreaSize)
          .position(x: centerX, y: centerY)

        // Instruction text below scan area
        Text("Helyezze a vonalkódot a keretbe")
          .font(.system(size: 16))
          .foregroundColor(.white)
          .position(x: centerX, y: centerY + scanAreaSize / 2 + 32)

        // Top control bar
        VStack {
          HStack {
            // Close button
            Button(action: onClose) {
              Text("✕")
                .font(.system(size: 20))
                .foregroundColor(.white)
                .frame(width: 44, height: 44)
                .background(Color.black.opacity(0.5))
                .clipShape(Circle())
            }
            .accessibilityLabel("Bezárás")
            .accessibilityHint("Visszatérés a könyvlistához")

            Spacer()

            // Flash toggle
            Button(action: onFlashToggle) {
              Text(state.isFlashOn ? "⚡" : "🔦")
                .font(.system(size: 20))
                .foregroundColor(.white)
                .frame(width: 44, height: 44)
                .background(Color.black.opacity(0.5))
                .clipShape(Circle())
            }
            .accessibilityLabel(state.isFlashOn ? "Vaku kikapcsolása" : "Vaku bekapcsolása")
          }
          .padding(.horizontal, 20)
          .padding(.top, 60)

          Spacer()
        }
      }
    }
    .ignoresSafeArea()
  }
}

// MARK: - Scan Area Mask Shape

/// A shape that fills the entire rect with a rectangular cutout in the center.
/// Uses even-odd fill rule to create the transparent scan area.
struct ScanAreaMask: Shape {
  let scanAreaSize: CGFloat
  let center: CGPoint

  func path(in rect: CGRect) -> Path {
    var path = Path()
    // Full screen rectangle
    path.addRect(rect)
    // Cutout rectangle
    let cutout = CGRect(
      x: center.x - scanAreaSize / 2,
      y: center.y - scanAreaSize / 2,
      width: scanAreaSize,
      height: scanAreaSize
    )
    path.addRect(cutout)
    return path
  }
}

// MARK: - Corner Markers

/// Draws L-shaped corner markers around the scan area.
struct CornerMarkers: View {
  let size: CGFloat
  private let cornerLength: CGFloat = 20
  private let lineWidth: CGFloat = 3

  var body: some View {
    ZStack {
      // Top-left
      CornerPath(corner: .topLeft, length: cornerLength)
        .stroke(Color.white, lineWidth: lineWidth)
        .frame(width: cornerLength, height: cornerLength)
        .position(x: cornerLength / 2, y: cornerLength / 2)

      // Top-right
      CornerPath(corner: .topRight, length: cornerLength)
        .stroke(Color.white, lineWidth: lineWidth)
        .frame(width: cornerLength, height: cornerLength)
        .position(x: size - cornerLength / 2, y: cornerLength / 2)

      // Bottom-left
      CornerPath(corner: .bottomLeft, length: cornerLength)
        .stroke(Color.white, lineWidth: lineWidth)
        .frame(width: cornerLength, height: cornerLength)
        .position(x: cornerLength / 2, y: size - cornerLength / 2)

      // Bottom-right
      CornerPath(corner: .bottomRight, length: cornerLength)
        .stroke(Color.white, lineWidth: lineWidth)
        .frame(width: cornerLength, height: cornerLength)
        .position(x: size - cornerLength / 2, y: size - cornerLength / 2)
    }
    .frame(width: size, height: size)
  }
}

enum Corner {
  case topLeft, topRight, bottomLeft, bottomRight
}

struct CornerPath: Shape {
  let corner: Corner
  let length: CGFloat

  func path(in rect: CGRect) -> Path {
    var path = Path()
    switch corner {
    case .topLeft:
      path.move(to: CGPoint(x: 0, y: length))
      path.addLine(to: CGPoint(x: 0, y: 0))
      path.addLine(to: CGPoint(x: length, y: 0))
    case .topRight:
      path.move(to: CGPoint(x: rect.maxX - length, y: 0))
      path.addLine(to: CGPoint(x: rect.maxX, y: 0))
      path.addLine(to: CGPoint(x: rect.maxX, y: length))
    case .bottomLeft:
      path.move(to: CGPoint(x: 0, y: rect.maxY - length))
      path.addLine(to: CGPoint(x: 0, y: rect.maxY))
      path.addLine(to: CGPoint(x: length, y: rect.maxY))
    case .bottomRight:
      path.move(to: CGPoint(x: rect.maxX - length, y: rect.maxY))
      path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
      path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - length))
    }
    return path
  }
}
