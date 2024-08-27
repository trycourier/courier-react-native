//
//  Utils.swift
//  courier-react-native
//
//  Created by Michael Miller on 10/23/23.
//

import Foundation
import Courier_iOS

extension UNAuthorizationStatus {

    var name: String {
        switch (self) {
        case .notDetermined: return "notDetermined"
        case .denied: return "denied"
        case .authorized: return "authorized"
        case .provisional: return "provisional"
        case .ephemeral: return "ephemeral"
        @unknown default: return "unknown"
        }
    }

}

internal extension String {
    
    func toRowAnimation() -> UITableView.RowAnimation {
        
        switch self.lowercased() {
            case "fade": return .fade
            case "right": return .right
            case "left": return .left
            case "top": return .top
            case "bottom": return .bottom
            case "none": return .none
            case "middle": return .middle
            case "automatic":
                if #available(iOS 11.0, *) {
                    return .automatic
                } else {
                    return .fade
                }
            default: return .fade
        }
        
    }
    
    func toSeparatorStyle() -> UITableViewCell.SeparatorStyle {
        
        switch self.lowercased() {
            case "none": return .none
            case "singleLine": return .singleLine
            case "singleLineEtched": return .singleLineEtched
            default: return .singleLine
        }
        
    }
    
    func toSelectionStyle() -> UITableViewCell.SelectionStyle? {
        
        switch self.lowercased() {
            case "none": return .none
            case "blue": return .blue
            case "gray": return .gray
            case "default": return .default
            default: return .default
        }
        
    }
    
    func toColor() -> UIColor? {
        
        var hexSanitized = trimmingCharacters(in: .whitespacesAndNewlines)
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

internal extension NSDictionary {
    
    func toButton(fallback: CourierStyles.Button) -> CourierStyles.Button {
        
        let font = self["font"] as? NSDictionary
        let backgroundColor = self["backgroundColor"] as? String
        let cornerRadius = self["cornerRadius"] as? CGFloat
        
        return CourierStyles.Button(
            font: font?.toFont() ?? fallback.font,
            backgroundColor: backgroundColor?.toColor() ?? fallback.backgroundColor,
            cornerRadius: cornerRadius ?? fallback.cornerRadius
        )
        
    }
    
    func toFont() -> CourierStyles.Font {
        
        let defaultColor: UIColor = .label
        let defaultFont: UIFont = UIFont.systemFont(ofSize: UIFont.labelFontSize)
        
        let family = self["family"] as? String ?? defaultFont.familyName
        let size = self["size"] as? CGFloat ?? defaultFont.pointSize
        let color = self["color"] as? String
        
        return CourierStyles.Font(
            font: UIFont(name: family, size: size) ?? defaultFont,
            color: color?.toColor() ?? defaultColor
        )
        
    }
    
    func toCellStyle() -> CourierStyles.Cell {
        
        let separatorStyle = self["separatorStyle"] as? String
        let separatorColor = self["separatorColor"] as? String
        let selectionStyle = self["selectionStyle"] as? String
        let insets = self["separatorInsets"] as? [String : Any]
        
        let top = insets?["top"] as? CGFloat
        let left = insets?["left"] as? CGFloat
        let right = insets?["right"] as? CGFloat
        let bottom = insets?["bottom"] as? CGFloat
        let separatorInsets = UIEdgeInsets(top: top ?? 0, left: left ?? 0, bottom: bottom ?? 0, right: right ?? 0)
        
        return CourierStyles.Cell(
            separatorStyle: separatorStyle?.toSeparatorStyle() ?? .singleLine,
            separatorInsets: separatorInsets,
            separatorColor: separatorColor?.toColor(),
            selectionStyle: selectionStyle?.toSelectionStyle() ?? .default
        )
        
    }
    
    func toInfoView(fallback: CourierStyles.InfoViewStyle) -> CourierStyles.InfoViewStyle {
        
        let font = self["font"] as? NSDictionary
        let button = self["button"] as? NSDictionary
        
        return CourierStyles.InfoViewStyle(
            font: font?.toFont() ?? fallback.font,
            button: button?.toButton(fallback: fallback.button) ?? fallback.button
        )
        
    }
    
}

internal extension Encodable {
    
    func toJson() throws -> String? {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        let data = try encoder.encode(self)
        return String(data: data, encoding: .utf8) ?? nil
    }
    
}

internal class Rejections {
    
    private static let CLIENT_TAG = "Courier Client Error"
    private static let SHARED_TAG = "Courier SDK Error"
    
    static func missingClient(_ reject: @escaping RCTPromiseRejectBlock) {
        reject("Missing Client", Rejections.CLIENT_TAG, nil)
    }
    
    static func clientError(_ reject: @escaping RCTPromiseRejectBlock, error: Error) {
        reject(String(describing: error), Rejections.CLIENT_TAG, nil)
    }
    
    static func sharedError(_ reject: @escaping RCTPromiseRejectBlock, error: Error) {
        reject(String(describing: error), Rejections.SHARED_TAG, nil)
    }
    
}
