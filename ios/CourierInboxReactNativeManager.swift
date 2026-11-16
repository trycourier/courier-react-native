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
  
    // Each style below fills the fields it leaves out from the fallback, as Android does

    func toTabStyle(fallback: CourierStyles.Inbox.TabStyle) -> CourierStyles.Inbox.TabStyle {
      
        let selected = self["selected"] as? NSDictionary
        let unselected = self["unselected"] as? NSDictionary
        
        return CourierStyles.Inbox.TabStyle(
          selected: selected?.toTabItemStyle(fallback: fallback.selected) ?? fallback.selected,
          unselected: unselected?.toTabItemStyle(fallback: fallback.unselected) ?? fallback.unselected
        )
      
    }
  
    func toTabItemStyle(fallback: CourierStyles.Inbox.TabItemStyle) -> CourierStyles.Inbox.TabItemStyle {
    
        let font = self["font"] as? NSDictionary
        let indicator = self["indicator"] as? NSDictionary
        
        return CourierStyles.Inbox.TabItemStyle(
          font: font?.toFont(fallback: fallback.font) ?? fallback.font,
          indicator: indicator?.toTabIndicatorStyle(fallback: fallback.indicator) ?? fallback.indicator
        )
      
    }
  
    func toTabIndicatorStyle(fallback: CourierStyles.Inbox.TabIndicatorStyle) -> CourierStyles.Inbox.TabIndicatorStyle {
      
        let font = self["font"] as? NSDictionary
        let color = self["color"] as? String
        
        return CourierStyles.Inbox.TabIndicatorStyle(
          font: font?.toFont(fallback: fallback.font) ?? fallback.font,
          color: color?.toColor() ?? fallback.color
        )
      
    }
  
    func toReadingSwipeActionStyle(fallback: CourierStyles.Inbox.ReadingSwipeActionStyle) -> CourierStyles.Inbox.ReadingSwipeActionStyle {
      
        let read = self["read"] as? NSDictionary
        let unread = self["unread"] as? NSDictionary
        
        return CourierStyles.Inbox.ReadingSwipeActionStyle(
            read: read?.toSwipeActionStyle(fallback: fallback.read) ?? fallback.read,
            unread: unread?.toSwipeActionStyle(fallback: fallback.unread) ?? fallback.unread
        )
      
    }
  
    func toArchivingSwipeActionStyle(fallback: CourierStyles.Inbox.ArchivingSwipeActionStyle) -> CourierStyles.Inbox.ArchivingSwipeActionStyle {
      
        let archive = self["archive"] as? NSDictionary
        
        return CourierStyles.Inbox.ArchivingSwipeActionStyle(
            archive: archive?.toSwipeActionStyle(fallback: fallback.archive) ?? fallback.archive
        )
      
    }
  
    func toSwipeActionStyle(fallback: CourierStyles.Inbox.SwipeActionStyle) -> CourierStyles.Inbox.SwipeActionStyle {
      
      // Get the image from assets if possible
      let icon = (self["icon"] as? String).flatMap { UIImage(named: $0) }
      let color = self["color"] as? String
      
      return CourierStyles.Inbox.SwipeActionStyle(
        icon: icon ?? fallback.icon,
        color: color?.toColor() ?? fallback.color
      )
      
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
            unread: unread?.toFont(fallback: fallback.unread) ?? fallback.unread,
            read: read?.toFont(fallback: fallback.read) ?? fallback.read
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
        let backgroundColor = self["backgroundColor"] as? String
        let tabBackgroundColor = self["tabBackgroundColor"] as? String
        let listItemBackgroundColor = self["listItemBackgroundColor"] as? String
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
            backgroundColor: backgroundColor?.toColor() ?? .systemBackground,
            tabBackgroundColor: tabBackgroundColor?.toColor() ?? .systemBackground,
            listItemBackgroundColor: listItemBackgroundColor?.toColor() ?? .systemBackground,
            tabIndicatorColor: tabIndicatorColor?.toColor(),
            tabStyle: tabStyle?.toTabStyle(fallback: CourierInboxView.defaultTabStyle()) ?? CourierInboxView.defaultTabStyle(),
            readingSwipeActionStyle: readingSwipeActionStyle?.toReadingSwipeActionStyle(fallback: CourierInboxView.defaultReadingStyle()) ?? CourierInboxView.defaultReadingStyle(),
            archivingSwipeActionStyle: archivingSwipeActionStyle?.toArchivingSwipeActionStyle(fallback: CourierInboxView.defaultArchivingStyle()) ?? CourierInboxView.defaultArchivingStyle(),
            messageAnimationStyle: messageAnimationStyle?.toRowAnimation() ?? .left,
            loadingIndicatorColor: loadingIndicatorColor?.toColor(),
            unreadIndicatorStyle: unreadIndicatorStyle?.toUnreadIndicatorStyle() ?? defaultTheme.unreadIndicatorStyle,
            titleStyle: titleStyle?.toTextStyle(fallback: defaultTheme.titleStyle) ?? defaultTheme.titleStyle,
            timeStyle: timeStyle?.toTextStyle(fallback: defaultTheme.timeStyle) ?? defaultTheme.timeStyle,
            bodyStyle: bodyStyle?.toTextStyle(fallback: defaultTheme.bodyStyle) ?? defaultTheme.bodyStyle,
            buttonStyle: buttonStyle?.toButtonStyle(fallback: defaultTheme.buttonStyle) ?? defaultTheme.buttonStyle,
            cellStyle: cellStyles?.toCellStyle(fallback: defaultTheme.cellStyle) ?? defaultTheme.cellStyle,
            infoViewStyle: infoViewStyle?.toInfoView(fallback: defaultTheme.infoViewStyle) ?? defaultTheme.infoViewStyle
        )
        
    }
    
}
