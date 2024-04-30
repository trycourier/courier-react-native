import Courier_iOS

@available(iOS 15.0, *)
@objc(CourierPreferencesViewManager)
class CourierPreferencesViewManager: RCTViewManager {

    override func view() -> (CourierPreferencesView) {
        return CourierPreferencesView()
    }

    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}

@available(iOS 15.0, *)
class CourierPreferencesView : UIView {
    
    @objc var mode: NSDictionary? = [:] {
        didSet {
            refresh()
        }
    }
    
    @objc var theme: NSDictionary? = [:] {
        didSet {
            refresh()
        }
    }
    
    @objc var onScrollPreferences: RCTBubblingEventBlock? = nil
    
    @objc var onPreferenceError: RCTBubblingEventBlock? = nil
    
    private func refresh() {
        
        UIView.setAnimationsEnabled(false)
        
        subviews.forEach {
            $0.removeFromSuperview()
        }
        
        let lightTheme = theme?["light"] as? NSDictionary
        let darkTheme = theme?["dark"] as? NSDictionary
        
        let courierPreferences = CourierPreferences(
            mode: mode?.toMode() ?? .channels(CourierUserPreferencesChannel.allCases),
            lightTheme: lightTheme?.toPreferencesTheme() ?? .defaultLight,
            darkTheme: darkTheme?.toPreferencesTheme() ?? .defaultDark,
            didScrollPreferences: { [weak self] scrollView in
                self?.onScrollPreferences?([
                    "contentOffset" : [
                        "y": scrollView.contentOffset.y,
                        "x": scrollView.contentOffset.x
                    ]
                ])
            },
            onError: { [weak self] error in
                self?.onPreferenceError?([
                    "error" : error.message
                ])
            }
        )
        
        courierPreferences.translatesAutoresizingMaskIntoConstraints = false
        addSubview(courierPreferences)
        
        NSLayoutConstraint.activate([
            courierPreferences.topAnchor.constraint(equalTo: topAnchor),
            courierPreferences.bottomAnchor.constraint(equalTo: bottomAnchor),
            courierPreferences.leadingAnchor.constraint(equalTo: leadingAnchor),
            courierPreferences.trailingAnchor.constraint(equalTo: trailingAnchor),
        ])
        
        UIView.setAnimationsEnabled(true)
        
    }
    
}

internal extension NSDictionary {
    
    @available(iOS 15.0, *)
    func toMode() -> CourierPreferences.Mode {
        
        let type = self["type"] as? String
        
        if (type == "topic") {
            return .topic
        } else if (type == "channels") {
            if let channels = self["channels"] as? [CourierUserPreferencesChannel.RawValue] {
                let mappedChannels = channels.compactMap { CourierUserPreferencesChannel(rawValue: $0) }
                return .channels(mappedChannels)
            } else {
                return .channels(CourierUserPreferencesChannel.allCases)
            }
        } else {
            return .channels(CourierUserPreferencesChannel.allCases)
        }
        
    }
    
    func toSheetSettingStyles() -> CourierStyles.Preferences.SettingStyles {
        
        let font = self["font"] as? NSDictionary
        let toggleColor = self["toggleColor"] as? String
        
        return CourierStyles.Preferences.SettingStyles(
            font: font?.toFont(),
            toggleColor: toggleColor?.toColor()
        )
        
    }
    
    func toPreferencesTheme() -> CourierPreferencesTheme? {
        
        let defaultTheme = CourierPreferencesTheme()
        
        let brandId = self["brandId"] as? String
        let sectionTitleFont = self["sectionTitleFont"] as? NSDictionary
        let topicTitleFont = self["topicTitleFont"] as? NSDictionary
        let topicSubtitleFont = self["topicSubtitleFont"] as? NSDictionary
        let topicButton = self["topicButton"] as? NSDictionary
        let sheetTitleFont = self["sheetTitleFont"] as? NSDictionary
        let infoViewStyle = self["infoViewStyle"] as? NSDictionary
        
        let iOS = self["iOS"] as? NSDictionary
        let topicCellStyles = iOS?["topicCellStyles"] as? NSDictionary
        let sheetSettingStyles = iOS?["sheetSettingStyles"] as? NSDictionary
        let sheetCornerRadius = iOS?["sheetCornerRadius"] as? CGFloat
        let sheetCellStyles = iOS?["sheetCellStyles"] as? NSDictionary
        
        return CourierPreferencesTheme(
            brandId: brandId,
            sectionTitleFont: sectionTitleFont?.toFont() ?? defaultTheme.sectionTitleFont,
            topicCellStyles: topicCellStyles?.toCellStyle() ?? defaultTheme.topicCellStyles,
            topicTitleFont: topicTitleFont?.toFont() ?? defaultTheme.topicTitleFont,
            topicSubtitleFont: topicSubtitleFont?.toFont() ?? defaultTheme.topicSubtitleFont,
            topicButton: topicButton?.toButton(fallback: defaultTheme.topicButton) ?? defaultTheme.topicButton,
            sheetTitleFont: sheetTitleFont?.toFont() ?? defaultTheme.sheetTitleFont,
            sheetSettingStyles: sheetSettingStyles?.toSheetSettingStyles() ?? defaultTheme.sheetSettingStyles,
            sheetCornerRadius: sheetCornerRadius ?? defaultTheme.sheetCornerRadius,
            sheetCellStyles: sheetCellStyles?.toCellStyle() ?? defaultTheme.sheetCellStyles,
            infoViewStyle: infoViewStyle?.toInfoView(fallback: defaultTheme.infoViewStyle) ?? defaultTheme.infoViewStyle
        )
        
    }
    
}
