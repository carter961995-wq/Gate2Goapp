//
//  MoneyFormatting.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import Foundation

struct MoneyFormatting {
    static func dollarsString(cents: Int) -> String {
        let dollars = Double(cents) / 100.0
        return String(format: "$%.2f", dollars)
    }
}
