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
            darkTheme: darkTheme?.toPreferencesTheme() ?? .defaultDark
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
    
    func toPreferencesTheme() -> CourierPreferencesTheme? {
        
//        let iOS = self["iOS"] as? [String : Any]
        let brandId = self["brandId"] as? String
        let sectionTitleFont = self["sectionTitleFont"] as? NSDictionary
        
        let defaultTheme = CourierPreferencesTheme()
        
        return CourierPreferencesTheme(
            brandId: brandId,
            sectionTitleFont: sectionTitleFont?.toFont() ?? defaultTheme.sectionTitleFont
//            topicCellStyles: CourierStyles.Cell(
//                separatorStyle: .none
//            ),
//            topicTitleFont: CourierStyles.Font(
//                font: UIFont(name: "Avenir Medium", size: 18)!,
//                color: textColor
//            ),
//            topicSubtitleFont: CourierStyles.Font(
//                font: UIFont(name: "Avenir Medium", size: 16)!,
//                color: .gray
//            ),
//            topicButton: CourierStyles.Button(
//                font: CourierStyles.Font(
//                    font: UIFont(name: "Avenir Medium", size: 16)!,
//                    color: .white
//                ),
//                backgroundColor: secondaryColor,
//                cornerRadius: 8
//            ),
//            sheetTitleFont: CourierStyles.Font(
//                font: UIFont(name: "Avenir Medium", size: 18)!,
//                color: textColor
//            ),
//            sheetSettingStyles: CourierStyles.Preferences.SettingStyles(
//                font: CourierStyles.Font(
//                    font: UIFont(name: "Avenir Medium", size: 18)!,
//                    color: textColor
//                ),
//                toggleColor: secondaryColor
//            ),
//            sheetCornerRadius: 0,
//            sheetCellStyles: CourierStyles.Cell(
//                separatorStyle: .none
//            ),
//            infoViewStyle: CourierStyles.InfoViewStyle(
//                font: CourierStyles.Font(
//                    font: UIFont(name: "Avenir Medium", size: 20)!,
//                    color: textColor
//                ),
//                button: CourierStyles.Button(
//                    font: CourierStyles.Font(
//                        font: UIFont(name: "Avenir Medium", size: 16)!,
//                        color: .white
//                    ),
//                    backgroundColor: secondaryColor,
//                    cornerRadius: 8
//                )
//            )
        )
        
    }
    
}
