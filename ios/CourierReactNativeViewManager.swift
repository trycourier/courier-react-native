import Courier_iOS

@objc(CourierReactNativeViewManager)
class CourierReactNativeViewManager: RCTViewManager {

    override func view() -> (CourierReactNativeView) {
        return CourierReactNativeView()
    }

    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}

class CourierReactNativeView : UIView {
    
    @objc var theme: NSDictionary = [:] {
        didSet {
            addInbox(theme: theme)
        }
    }
    
    private func addInbox(theme: NSDictionary) {
        
        subviews.forEach { $0.removeFromSuperview() }
        
        let color = theme["color"] as? String ?? ""
        let cornerRadius = theme["cornerRadius"] as? CGFloat ?? 0
        
        // Theme object containing all the styles you want to apply
        let inboxTheme = CourierInboxTheme(
            unreadIndicatorBarColor: colorFromHex(color) ?? .systemRed,
            buttonStyles: CourierInboxButtonStyles(
                backgroundColor: colorFromHex(color) ?? .systemRed,
                cornerRadius: cornerRadius
            )
        )
        
        // Create the view
        let courierInbox = CourierInbox(
            lightTheme: inboxTheme,
            darkTheme: inboxTheme,
            didClickInboxMessageAtIndex: { message, index in
                message.isRead ? message.markAsUnread() : message.markAsRead()
                print(index, message)
            },
            didClickInboxActionForMessageAtIndex: { action, message, index in
                print(action, message, index)
            },
            didScrollInbox: { scrollView in
                print(scrollView.contentOffset.y)
            }
        )

        // Add the view to your UI
        courierInbox.translatesAutoresizingMaskIntoConstraints = false
        addSubview(courierInbox)

        // Constrain the view how you'd like
        NSLayoutConstraint.activate([
            courierInbox.topAnchor.constraint(equalTo: topAnchor),
            courierInbox.bottomAnchor.constraint(equalTo: bottomAnchor),
            courierInbox.leadingAnchor.constraint(equalTo: leadingAnchor),
            courierInbox.trailingAnchor.constraint(equalTo: trailingAnchor),
        ])
        
    }
    
    private func colorFromHex(_ hexString: String) -> UIColor? {
        
        var hexSanitized = hexString.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")

        var rgb: UInt64 = 0

        Scanner(string: hexSanitized).scanHexInt64(&rgb)

        guard hexSanitized.count == 6 else {
            return nil
        }

        return UIColor(
            red: CGFloat((rgb & 0xFF0000) >> 16) / 255.0,
            green: CGFloat((rgb & 0x00FF00) >> 8) / 255.0,
            blue: CGFloat(rgb & 0x0000FF) / 255.0,
            alpha: 1.0
        )
        
    }
    
}
