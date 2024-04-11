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
        
        let courierPreferences = CourierPreferences()
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
