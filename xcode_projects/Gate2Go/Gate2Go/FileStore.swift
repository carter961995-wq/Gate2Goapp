//
//  FileStore.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import Foundation
import UIKit

struct FileStore {
    static func writeJPEG(_ image: UIImage, fileName: String, subdirectory: String) throws -> String {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let folder = docs.appendingPathComponent(subdirectory, isDirectory: true)
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        let url = folder.appendingPathComponent(fileName)
        guard let data = image.jpegData(compressionQuality: 0.85) else {
            throw NSError(domain: "FileStore", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to encode image"])
        }
        try data.write(to: url)
        return "\(subdirectory)/\(fileName)"
    }
    
    static func readUIImage(path: String) -> UIImage? {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let url = docs.appendingPathComponent(path)
        guard let data = try? Data(contentsOf: url) else { return nil }
        return UIImage(data: data)
    }
}
