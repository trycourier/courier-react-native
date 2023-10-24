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
        let unreadIndicatorBarColor = dict["unreadIndicatorBarColor"] as? String
        
        // Loading
        let loadingIndicatorColor = dict["loadingIndicatorColor"] as? String
        
        // Title
        let titleFont = dict["titleFont"] as? [String : Any]
        
        // Time
        let timeFont = dict["timeFont"] as? [String : Any]
        
        // Body
        let bodyFont = dict["bodyFont"] as? [String : Any]
        
        // Detail
        let detailTitleFont = dict["detailTitleFont"] as? [String : Any]
        
        // Detail
        let buttonStyles = dict["buttonStyles"] as? [String : Any]
        
        return CourierInboxTheme(
            messageAnimationStyle: messageAnimationStyle?.toRowAnimation() ?? .left,
            unreadIndicatorBarColor: unreadIndicatorBarColor?.toColor(),
            loadingIndicatorColor: loadingIndicatorColor?.toColor(),
            titleFont: dictionaryToFont(
                dictionary: titleFont,
                defaultFont: UIFont.boldSystemFont(ofSize: UIFont.labelFontSize),
                defaultColor: .label
            ),
            timeFont: dictionaryToFont(
                dictionary: timeFont,
                defaultFont: UIFont.systemFont(ofSize: UIFont.labelFontSize),
                defaultColor: .placeholderText
            ),
            bodyFont: dictionaryToFont(
                dictionary: bodyFont,
                defaultFont: UIFont.systemFont(ofSize: UIFont.labelFontSize),
                defaultColor: .label
            ),
            detailTitleFont: dictionaryToFont(
                dictionary: detailTitleFont,
                defaultFont: UIFont.systemFont(ofSize: UIFont.labelFontSize),
                defaultColor: .label
            ),
            buttonStyles: dictionaryToButtonStyles(
                dictionary: buttonStyles
            ),
            cellStyles: dictionaryToCellStyles(
                dictionary: cellStyles
            )
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
    
    func dictionaryToButtonStyles(dictionary: [String : Any]?) -> CourierInboxButtonStyles {
        
        guard let dict = dictionary else {
            return CourierInboxButtonStyles()
        }
        
        let font = dict["font"] as? [String : Any]
        let backgroundColor = dict["backgroundColor"] as? String
        let cornerRadius = dict["cornerRadius"] as? CGFloat
        
        return CourierInboxButtonStyles(
            font: dictionaryToFont(
                dictionary: font,
                defaultFont: UIFont.systemFont(ofSize: UIFont.labelFontSize),
                defaultColor: .white
            ),
            backgroundColor: backgroundColor?.toColor(),
            cornerRadius: cornerRadius ?? 8
        )
        
    }
    
    func dictionaryToCellStyles(dictionary: [String : Any]?) -> CourierInboxCellStyles {
        
        guard let dict = dictionary else {
            return CourierInboxCellStyles()
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
        
        return CourierInboxCellStyles(
            separatorStyle: separatorStyle?.toSeparatorStyle() ?? .singleLine,
            separatorInsets: separatorInsets,
            separatorColor: separatorColor?.toColor(),
            selectionStyle: selectionStyle?.toSelectionStyle() ?? .default
        )
        
    }
    
}
