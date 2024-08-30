import Courier_iOS

@objc(CourierInboxViewManager)
class CourierInboxViewManager: RCTViewManager {

    override func view() -> (CourierInboxView) {
        return CourierInboxView()
    }

    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}

class CourierInboxView : UIView {
    
    @objc var theme: NSDictionary? = [:] {
        didSet {
            refresh()
        }
    }
    
    @objc var onClickInboxMessageAtIndex: RCTBubblingEventBlock? = nil
    
    @objc var onClickInboxActionForMessageAtIndex: RCTBubblingEventBlock? = nil
    
    @objc var onScrollInbox: RCTBubblingEventBlock? = nil
    
    private func refresh() {
        
        UIView.setAnimationsEnabled(false)
        
        subviews.forEach {
            $0.removeFromSuperview()
        }
        
        let lightTheme = theme?["light"] as? NSDictionary
        let darkTheme = theme?["dark"] as? NSDictionary
        
        let courierInbox = CourierInbox(
            lightTheme: lightTheme?.toInboxTheme() ?? .defaultLight,
            darkTheme: darkTheme?.toInboxTheme() ?? .defaultDark,
            didClickInboxMessageAtIndex: { [weak self] message, index in
                do {
                    self?.onClickInboxMessageAtIndex?([
                        "message" : try message.toJson() ?? "",
                        "index" : index
                    ])
                } catch {
                    Courier.shared.client?.error(error.localizedDescription)
                }
            },
            didClickInboxActionForMessageAtIndex: { [weak self] action, message, index in
                do {
                    self?.onClickInboxActionForMessageAtIndex?([
                        "action" : try action.toJson() ?? "",
                        "message" : try message.toJson() ?? "",
                        "index" : index
                    ])
                } catch {
                    Courier.shared.client?.error(error.localizedDescription)
                }
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

        courierInbox.translatesAutoresizingMaskIntoConstraints = false
        addSubview(courierInbox)

        NSLayoutConstraint.activate([
            courierInbox.topAnchor.constraint(equalTo: topAnchor),
            courierInbox.bottomAnchor.constraint(equalTo: bottomAnchor),
            courierInbox.leadingAnchor.constraint(equalTo: leadingAnchor),
            courierInbox.trailingAnchor.constraint(equalTo: trailingAnchor),
        ])
        
        UIView.setAnimationsEnabled(true)
        
    }
    
}

internal extension NSDictionary {
    
    func toUnreadIndicatorStyle() -> CourierStyles.Inbox.UnreadIndicatorStyle {
        
        let indicator = self["indicator"] as? String
        let color = self["color"] as? String
        
        var style: CourierStyles.Inbox.UnreadIndicator = .line

        if (indicator == "dot") {
            style = .dot
        }
        
        return CourierStyles.Inbox.UnreadIndicatorStyle(
            indicator: style,
            color: color?.toColor()
        )
        
    }
    
    func toTextStyle(fallback: CourierStyles.Inbox.TextStyle) -> CourierStyles.Inbox.TextStyle {
        
        let unread = self["unread"] as? NSDictionary
        let read = self["read"] as? NSDictionary
        
        return CourierStyles.Inbox.TextStyle(
            unread: unread?.toFont() ?? fallback.unread,
            read: read?.toFont() ?? fallback.read
        )
        
    }
    
    func toButtonStyle(fallback: CourierStyles.Inbox.ButtonStyle) -> CourierStyles.Inbox.ButtonStyle {
        
        let unread = self["unread"] as? NSDictionary
        let read = self["read"] as? NSDictionary
        
        return CourierStyles.Inbox.ButtonStyle(
            unread: unread?.toButton(fallback: fallback.unread) ?? fallback.unread,
            read: read?.toButton(fallback: fallback.read) ?? fallback.read
        )
        
    }
    
    func toInboxTheme() -> CourierInboxTheme? {
        
        let defaultTheme = CourierInboxTheme()
        
        let brandId = self["brandId"] as? String
        let unreadIndicatorStyle = self["unreadIndicatorStyle"] as? NSDictionary
        let loadingIndicatorColor = self["loadingIndicatorColor"] as? String
        let titleStyle = self["titleStyle"] as? NSDictionary
        let timeStyle = self["timeStyle"] as? NSDictionary
        let bodyStyle = self["bodyStyle"] as? NSDictionary
        let infoViewStyle = self["infoViewStyle"] as? NSDictionary
        let buttonStyle = self["buttonStyle"] as? NSDictionary
        
        let iOS = self["iOS"] as? NSDictionary
        let messageAnimationStyle = iOS?["messageAnimationStyle"] as? String
        let cellStyles = iOS?["cellStyles"] as? NSDictionary
        
        return CourierInboxTheme(
            brandId: brandId,
            messageAnimationStyle: messageAnimationStyle?.toRowAnimation() ?? .left,
            loadingIndicatorColor: loadingIndicatorColor?.toColor(),
            unreadIndicatorStyle: unreadIndicatorStyle?.toUnreadIndicatorStyle() ?? defaultTheme.unreadIndicatorStyle,
            titleStyle: titleStyle?.toTextStyle(fallback: defaultTheme.titleStyle) ?? defaultTheme.titleStyle,
            timeStyle: timeStyle?.toTextStyle(fallback: defaultTheme.timeStyle) ?? defaultTheme.timeStyle,
            bodyStyle: bodyStyle?.toTextStyle(fallback: defaultTheme.bodyStyle) ?? defaultTheme.bodyStyle,
            buttonStyle: buttonStyle?.toButtonStyle(fallback: defaultTheme.buttonStyle) ?? defaultTheme.buttonStyle,
            cellStyle: cellStyles?.toCellStyle() ?? defaultTheme.cellStyle,
            infoViewStyle: infoViewStyle?.toInfoView(fallback: defaultTheme.infoViewStyle) ?? defaultTheme.infoViewStyle
        )
        
    }
    
}
