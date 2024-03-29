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
    
    @objc var theme: NSDictionary? = [:] {
        didSet {
            refreshInbox()
        }
    }
    
    @objc var onClickInboxMessageAtIndex: RCTBubblingEventBlock? = nil
    
    @objc var onClickInboxActionForMessageAtIndex: RCTBubblingEventBlock? = nil
    
    @objc var onScrollInbox: RCTBubblingEventBlock? = nil
    
    private func refreshInbox() {
        
        // Disable animations
        UIView.setAnimationsEnabled(false)
        
        // Remove all previous views
        subviews.forEach {
            $0.removeFromSuperview()
        }
        
        let lightTheme = theme?["light"] as? NSDictionary
        let darkTheme = theme?["dark"] as? NSDictionary
        
        // Create the view
        let courierInbox = CourierInbox(
            lightTheme: dictionaryToTheme(dictionary: lightTheme) ?? .defaultLight,
            darkTheme: dictionaryToTheme(dictionary: darkTheme) ?? .defaultDark,
            didClickInboxMessageAtIndex: { [weak self] message, index in
                self?.onClickInboxMessageAtIndex?([
                    "message" : message.toDictionary(),
                    "index" : index
                ])
            },
            didClickInboxActionForMessageAtIndex: { [weak self] action, message, index in
                self?.onClickInboxActionForMessageAtIndex?([
                    "action" : action.toDictionary(),
                    "message" : message.toDictionary(),
                    "index" : index
                ])
            },
            didScrollInbox: { [weak self] scrollView in
                self?.onScrollInbox?([
                    "contentOffset" : [
                        "y": scrollView.contentOffset.y,
                        "x": scrollView.contentOffset.x
                    ]
                ])
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
        
        // Enable animations
        UIView.setAnimationsEnabled(true)
        
    }
    
    func dictionaryToTheme(dictionary: NSDictionary?) -> CourierInboxTheme? {
        
        guard let dict = dictionary else {
            return nil
        }
        
        // iOS Theme
        let iOS = dict["iOS"] as? [String : Any]
        let messageAnimationStyle = iOS?["messageAnimationStyle"] as? String
        let cellStyles = iOS?["cellStyles"] as? [String : Any]
        
        // Unread
        let unreadIndicatorStyle = dict["unreadIndicatorStyle"] as? [String : Any]
        
        // Loading
        let loadingIndicatorColor = dict["loadingIndicatorColor"] as? String
        
        // Title
        let titleStyle = dict["titleStyle"] as? [String : Any]
        
        // Time
        let timeStyle = dict["timeStyle"] as? [String : Any]
        
        // Body
        let bodyStyle = dict["bodyStyle"] as? [String : Any]
        
        // Info View
        let infoViewStyle = dict["infoViewStyle"] as? [String : Any]
        
        // Button
        let buttonStyle = dict["buttonStyle"] as? [String : Any]
        
        return CourierInboxTheme(
            messageAnimationStyle: messageAnimationStyle?.toRowAnimation() ?? .left,
            loadingIndicatorColor: loadingIndicatorColor?.toColor(),
            unreadIndicatorStyle: dictionaryToUnreadStyle(dictionary: unreadIndicatorStyle),
            titleStyle: dictionaryToTextStyle(dictionary: titleStyle),
            timeStyle: dictionaryToTextStyle(dictionary: timeStyle),
            bodyStyle: dictionaryToTextStyle(dictionary: bodyStyle),
            buttonStyle: dictionaryToButtonStyle(dictionary: buttonStyle),
            cellStyle: dictionaryToCellStyles(dictionary: cellStyles),
            infoViewStyle: dictionaryToInfoViewStyle(dictionary: infoViewStyle)
        )
        
    }
    
    func dictionaryToUnreadStyle(dictionary: [String : Any]?) -> CourierInboxUnreadIndicatorStyle {
        
        guard let dict = dictionary else {
            return CourierInboxUnreadIndicatorStyle()
        }
        
        let indicator = dict["indicator"] as? String
        let color = dict["color"] as? String
        
        var style: CourierInboxUnreadIndicator = .line

        if (indicator == "dot") {
            style = .dot
        }
        
        return CourierInboxUnreadIndicatorStyle(
            indicator: style,
            color: color?.toColor()
        )
        
    }
    
    func dictionaryToFont(dictionary: [String : Any]?, defaultFont: UIFont, defaultColor: UIColor) -> CourierInboxFont {
        
        guard let dict = dictionary else {
            return CourierInboxFont(
                font: defaultFont,
                color: defaultColor
            )
        }
        
        let family = dict["family"] as? String ?? defaultFont.familyName
        let size = dict["size"] as? CGFloat ?? defaultFont.pointSize
        let color = dict["color"] as? String
        
        return CourierInboxFont(
            font: UIFont(name: family, size: size) ?? defaultFont,
            color: color?.toColor() ?? defaultColor
        )
        
    }
    
    func dictionaryToButton(dictionary: [String : Any]?) -> CourierInboxButton {
        
        guard let dict = dictionary else {
            return CourierInboxButton(
                font: CourierInboxFont(
                    font: UIFont.systemFont(ofSize: UIFont.labelFontSize),
                    color: .white
                )
            )
        }
        
        let font = dict["font"] as? [String : Any]
        let backgroundColor = dict["backgroundColor"] as? String
        let cornerRadius = dict["cornerRadius"] as? CGFloat
        
        return CourierInboxButton(
            font: dictionaryToFont(
                dictionary: font,
                defaultFont: UIFont.systemFont(ofSize: UIFont.labelFontSize),
                defaultColor: .white
            ),
            backgroundColor: backgroundColor?.toColor(),
            cornerRadius: cornerRadius ?? 8
        )
        
    }
    
    func dictionaryToButtonStyle(dictionary: [String : Any]?) -> CourierInboxButtonStyle {
        
        guard let dict = dictionary else {
            return CourierInboxButtonStyle()
        }
        
        let unread = dict["unread"] as? [String : Any]
        let read = dict["read"] as? [String : Any]
        
        return CourierInboxButtonStyle(
            unread: dictionaryToButton(dictionary: unread),
            read: dictionaryToButton(dictionary: read)
        )
        
    }
    
    func dictionaryToInfoViewStyle(dictionary: [String : Any]?) -> CourierInboxInfoViewStyle {
        
        let defaultColor: UIColor = .label
        let defaultFont: UIFont = UIFont.systemFont(ofSize: UIFont.labelFontSize)
        
        let defaultInboxFont = CourierInboxFont(
            font: defaultFont,
            color: defaultColor
        )
        
        guard let dict = dictionary else {
            return CourierInboxInfoViewStyle(
                font: defaultInboxFont,
                button: CourierInboxButton(
                    font: defaultInboxFont
                )
            )
        }
        
        let font = dict["font"] as? [String : Any]
        let button = dict["button"] as? [String : Any]
        
        return CourierInboxInfoViewStyle(
            font: dictionaryToFont(dictionary: font, defaultFont: defaultFont, defaultColor: defaultColor), 
            button: dictionaryToButton(dictionary: button)
        )
        
    }
    
    func dictionaryToTextStyle(dictionary: [String : Any]?) -> CourierInboxTextStyle {
        
        let defaultColor: UIColor = .label
        let defaultFont: UIFont = UIFont.systemFont(ofSize: UIFont.labelFontSize)
        
        let defaultInboxFont = CourierInboxFont(
            font: defaultFont,
            color: defaultColor
        )
        
        let defaultText = CourierInboxTextStyle(
            unread: defaultInboxFont,
            read: defaultInboxFont
        )
        
        guard let dict = dictionary else {
            return defaultText
        }
        
        let unread = dict["unread"] as? [String : Any]
        let read = dict["read"] as? [String : Any]
        
        return CourierInboxTextStyle(
            unread: dictionaryToFont(dictionary: unread, defaultFont: defaultFont, defaultColor: defaultColor),
            read: dictionaryToFont(dictionary: read, defaultFont: defaultFont, defaultColor: defaultColor)
        )
        
    }
    
    func dictionaryToCellStyles(dictionary: [String : Any]?) -> CourierInboxCellStyle {
        
        guard let dict = dictionary else {
            return CourierInboxCellStyle()
        }
        
        let separatorStyle = dict["separatorStyle"] as? String
        let separatorColor = dict["separatorColor"] as? String
        let selectionStyle = dict["selectionStyle"] as? String
        
        let insets = dict["separatorInsets"] as? [String : Any]
        let top = insets?["top"] as? CGFloat
        let left = insets?["left"] as? CGFloat
        let right = insets?["right"] as? CGFloat
        let bottom = insets?["bottom"] as? CGFloat
        let separatorInsets = UIEdgeInsets(top: top ?? 0, left: left ?? 0, bottom: bottom ?? 0, right: right ?? 0)
        
        return CourierInboxCellStyle(
            separatorStyle: separatorStyle?.toSeparatorStyle() ?? .singleLine,
            separatorInsets: separatorInsets,
            separatorColor: separatorColor?.toColor(),
            selectionStyle: selectionStyle?.toSelectionStyle() ?? .default
        )
        
    }
    
}
