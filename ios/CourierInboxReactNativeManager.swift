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
  
    @objc var canSwipePages: Bool = false {
        didSet {
            refresh()
        }
    }
    
    @objc var theme: NSDictionary? = [:] {
        didSet {
            refresh()
        }
    }
    
    @objc var onClickInboxMessageAtIndex: RCTBubblingEventBlock? = nil
  
    @objc var onLongPressInboxMessageAtIndex: RCTBubblingEventBlock? = nil
    
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
            canSwipePages: self.canSwipePages,
            lightTheme: lightTheme?.toInboxTheme() ?? .defaultLight,
            darkTheme: darkTheme?.toInboxTheme() ?? .defaultDark,
            didClickInboxMessageAtIndex: { [weak self] message, index in
              Task {
                do {
                  self?.onClickInboxMessageAtIndex?([
                      "message" : try message.toJson() ?? "",
                      "index" : index
                  ])
                } catch {
                  await Courier.shared.client?.error(error.localizedDescription)
                }
              }
            },
            didLongPressInboxMessageAtIndex: { [weak self] message, index in
              Task {
                do {
                  self?.onLongPressInboxMessageAtIndex?([
                      "message" : try message.toJson() ?? "",
                      "index" : index
                  ])
                } catch {
                  await Courier.shared.client?.error(error.localizedDescription)
                }
              }
            },
            didClickInboxActionForMessageAtIndex: { [weak self] action, message, index in
              Task {
                do {
                  self?.onClickInboxActionForMessageAtIndex?([
                      "action" : try action.toJson() ?? "",
                      "message" : try message.toJson() ?? "",
                      "index" : index
                  ])
                } catch {
                  await Courier.shared.client?.error(error.localizedDescription)
                }
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
  
    internal static func defaultTabStyle() -> CourierStyles.Inbox.TabStyle {
        return CourierStyles.Inbox.TabStyle(
            selected: CourierStyles.Inbox.TabItemStyle(
                font: CourierStyles.Font(
                    font: UIFont.boldSystemFont(ofSize: UIFont.labelFontSize),
                    color: .label
                ),
                indicator: CourierStyles.Inbox.TabIndicatorStyle(
                    font: CourierStyles.Font(
                        font: UIFont.boldSystemFont(ofSize: UIFont.systemFontSize),
                        color: .white
                    ),
                    color: .systemBlue
                )
            ),
            unselected: CourierStyles.Inbox.TabItemStyle(
                font: CourierStyles.Font(
                    font: UIFont.boldSystemFont(ofSize: UIFont.labelFontSize),
                    color: .secondaryLabel
                ),
                indicator: CourierStyles.Inbox.TabIndicatorStyle(
                    font: CourierStyles.Font(
                        font: UIFont.boldSystemFont(ofSize: UIFont.systemFontSize),
                        color: .label
                    ),
                    color: .lightGray
                )
            )
        )
    }
  
    internal static func defaultReadingStyle() -> CourierStyles.Inbox.ReadingSwipeActionStyle {
      return CourierStyles.Inbox.ReadingSwipeActionStyle(
        read: CourierStyles.Inbox.SwipeActionStyle(
            icon: UIImage(systemName: "envelope.fill"),
            color: .systemGray
        ),
        unread: CourierStyles.Inbox.SwipeActionStyle(
            icon: UIImage(systemName: "envelope.open.fill"),
            color: .systemBlue
        )
      )
    }
    
    internal static func defaultArchivingStyle() -> CourierStyles.Inbox.ArchivingSwipeActionStyle {
      return CourierStyles.Inbox.ArchivingSwipeActionStyle(
        archive: CourierStyles.Inbox.SwipeActionStyle(
            icon: UIImage(systemName: "archivebox.fill"),
            color: .systemRed
        )
      )
    }
    
}

internal extension NSDictionary {
  
    func toTabStyle() -> CourierStyles.Inbox.TabStyle? {
      
        guard let selectedDict = self["selected"] as? NSDictionary, let unselectedDict = self["unselected"] as? NSDictionary else {
            return nil
        }
        
        guard let selected = selectedDict.toTabItemStyle(), let unselected = unselectedDict.toTabItemStyle() else {
          return nil
        }
        
        return CourierStyles.Inbox.TabStyle(
          selected: selected,
          unselected: unselected
        )
      
    }
  
    func toTabItemStyle() -> CourierStyles.Inbox.TabItemStyle? {
    
        guard let fontDict = self["font"] as? NSDictionary, let indicatorDict = self["indicator"] as? NSDictionary else {
            return nil
        }
        
        let font = fontDict.toFont()
        guard let indicator = indicatorDict.toTabIndicatorStyle() else {
            return nil
        }
        
        return CourierStyles.Inbox.TabItemStyle(font: font, indicator: indicator)
      
    }
  
    func toTabIndicatorStyle() -> CourierStyles.Inbox.TabIndicatorStyle? {
      
        guard let fontDict = self["font"] as? NSDictionary, let colorString = self["color"] as? String else {
            return nil
        }
      
        let font = fontDict.toFont()
        guard let color = colorString.toColor() else {
          return nil
        }
        
        return CourierStyles.Inbox.TabIndicatorStyle(
          font: font,
          color: color
        )
      
    }
  
    func toReadingSwipeActionStyle() -> CourierStyles.Inbox.ReadingSwipeActionStyle? {
      
        guard let readDict = self["read"] as? NSDictionary, let unreadDict = self["unread"] as? NSDictionary else {
            return nil
        }
        
        guard let read = readDict.toSwipeActionStyle(), let unread = unreadDict.toSwipeActionStyle() else {
            return nil
        }
        
        return CourierStyles.Inbox.ReadingSwipeActionStyle(
            read: read,
            unread: unread
        )
      
    }
  
    func toArchivingSwipeActionStyle() -> CourierStyles.Inbox.ArchivingSwipeActionStyle? {
      
        guard let archiveDict = self["archive"] as? NSDictionary else {
            return nil
        }
        
        guard let archive = archiveDict.toSwipeActionStyle() else {
            return nil
        }
        
        return CourierStyles.Inbox.ArchivingSwipeActionStyle(archive: archive)
      
    }
  
    func toSwipeActionStyle() -> CourierStyles.Inbox.SwipeActionStyle? {
      
      // Get the image from assets if possible
      var image: UIImage? = nil
      if let icon = self["icon"] as? String {
        image = UIImage(named: icon)
      }
    
      guard let colorString = self["color"] as? String else {
        return nil
      }
      
      let color = colorString.toColor() ?? .systemBlue
      
      return CourierStyles.Inbox.SwipeActionStyle(icon: image, color: color)
      
    }
    
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
        let tabIndicatorColor = self["tabIndicatorColor"] as? String
        let tabStyle = self["tabStyle"] as? NSDictionary
        let readingSwipeActionStyle = self["readingSwipeActionStyle"] as? NSDictionary
        let archivingSwipeActionStyle = self["archivingSwipeActionStyle"] as? NSDictionary
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
            tabIndicatorColor: tabIndicatorColor?.toColor(),
            tabStyle: tabStyle?.toTabStyle() ?? CourierInboxView.defaultTabStyle(),
            readingSwipeActionStyle: readingSwipeActionStyle?.toReadingSwipeActionStyle() ?? CourierInboxView.defaultReadingStyle(),
            archivingSwipeActionStyle: archivingSwipeActionStyle?.toArchivingSwipeActionStyle() ?? CourierInboxView.defaultArchivingStyle(),
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
