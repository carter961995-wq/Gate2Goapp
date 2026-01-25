import Foundation
import UIKit

@MainActor
enum ImageGenerationService {
    struct ImageResponse: Decodable {
        let success: Bool?
        let imageUrl: String?
        let prompt: String?
        let size: String?
        let error: String?
    }

    enum ServiceError: LocalizedError {
        case badResponse
        case server(String)
        case invalidImage

        var errorDescription: String? {
            switch self {
            case .badResponse: return "Server error. Please try again."
            case .server(let msg): return msg
            case .invalidImage: return "Image data was invalid."
            }
        }
    }

    static func generateImageData(prompt: String) async throws -> Data {
        var request = URLRequest(
            url: URL(string: "https://image-gate.replit.app/api/images/generate")!
        )
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["prompt": prompt])

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 120
        config.timeoutIntervalForResource = 120
        let session = URLSession(configuration: config)

        let (data, response) = try await session.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw ServiceError.badResponse
        }

        if !(200...299).contains(http.statusCode) {
            let message = String(data: data, encoding: .utf8) ?? "Server error"
            throw ServiceError.server(message)
        }

        let decoded = try JSONDecoder().decode(ImageResponse.self, from: data)

        if decoded.success == false {
            throw ServiceError.server(decoded.error ?? "Image generation failed.")
        }

        // imageUrl is a data URL like "data:image/png;base64,iVBOR..."
        // Extract the base64 part after the comma
        if let urlString = decoded.imageUrl,
           let commaIndex = urlString.firstIndex(of: ",") {
            let base64String = String(urlString[urlString.index(after: commaIndex)...])
            if let imageData = Data(base64Encoded: base64String) {
                return imageData
            }
        }

        throw ServiceError.invalidImage
    }
}
