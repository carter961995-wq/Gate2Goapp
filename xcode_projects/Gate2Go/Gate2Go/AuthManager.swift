import SwiftUI
import Combine
import AuthenticationServices
import CryptoKit
import Security

#if canImport(FirebaseAuth)
import FirebaseAuth
import FirebaseCore
#endif

@MainActor
final class AuthManager: ObservableObject {
    enum Mode: String {
        case signedOut
        case guest
        case authenticated
    }

    @Published private(set) var mode: Mode = .signedOut
    @Published private(set) var isLoading: Bool = true
    @Published var errorMessage: String?
    @Published private(set) var isFirebaseConfigured: Bool = true

    @AppStorage("authMode") private var authModeRaw: String = Mode.signedOut.rawValue
    private var currentNonce: String?

#if canImport(FirebaseAuth)
    private var authListener: AuthStateDidChangeListenerHandle?
#endif

    init() {
        configureFirebaseIfNeeded()
        observeAuthState()
    }

    var isAuthenticated: Bool {
        mode == .authenticated
    }

    var isGuest: Bool {
        mode == .guest
    }

    var userEmail: String? {
#if canImport(FirebaseAuth)
        return Auth.auth().currentUser?.email
#else
        return nil
#endif
    }

    func continueAsGuest() {
        authModeRaw = Mode.guest.rawValue
        mode = .guest
        errorMessage = nil
    }

    func beginSignIn() {
        authModeRaw = Mode.signedOut.rawValue
        mode = .signedOut
        errorMessage = nil
    }

    func signOut() {
#if canImport(FirebaseAuth)
        do {
            try Auth.auth().signOut()
        } catch {
            errorMessage = error.localizedDescription
        }
#endif
        authModeRaw = Mode.signedOut.rawValue
        mode = .signedOut
    }

    func signIn(email: String, password: String) async {
        errorMessage = nil
        guard isFirebaseConfigured else {
            errorMessage = "Firebase is not configured."
            return
        }
#if canImport(FirebaseAuth)
        do {
            try await signInWithEmail(email: email, password: password)
            authModeRaw = Mode.authenticated.rawValue
            mode = .authenticated
        } catch {
            errorMessage = error.localizedDescription
        }
#else
        errorMessage = "Firebase Auth is unavailable."
#endif
    }

    func signUp(email: String, password: String) async {
        errorMessage = nil
        guard isFirebaseConfigured else {
            errorMessage = "Firebase is not configured."
            return
        }
#if canImport(FirebaseAuth)
        do {
            try await createUser(email: email, password: password)
            authModeRaw = Mode.authenticated.rawValue
            mode = .authenticated
        } catch {
            errorMessage = error.localizedDescription
        }
#else
        errorMessage = "Firebase Auth is unavailable."
#endif
    }

    func deleteAccount() async {
        errorMessage = nil
#if canImport(FirebaseAuth)
        guard let user = Auth.auth().currentUser else {
            errorMessage = "No signed-in account found."
            return
        }
        do {
            try await deleteUser(user)
            authModeRaw = Mode.signedOut.rawValue
            mode = .signedOut
        } catch {
            errorMessage = error.localizedDescription
        }
#else
        errorMessage = "Firebase Auth is unavailable."
#endif
    }

    func prepareAppleRequest(_ request: ASAuthorizationAppleIDRequest) {
        let nonce = randomNonceString()
        currentNonce = nonce
        request.requestedScopes = [.fullName, .email]
        request.nonce = sha256(nonce)
    }

    func handleAppleCompletion(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            guard
                let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential,
                let nonce = currentNonce,
                let tokenData = appleIDCredential.identityToken,
                let tokenString = String(data: tokenData, encoding: .utf8)
            else {
                errorMessage = "Apple Sign-In failed."
                return
            }
            Task {
                await signInWithApple(idTokenString: tokenString, nonce: nonce)
            }
        case .failure(let error):
            errorMessage = error.localizedDescription
        }
    }

    private func configureFirebaseIfNeeded() {
#if canImport(FirebaseCore)
        if FirebaseApp.app() != nil {
            isFirebaseConfigured = true
            return
        }
        if let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
           let options = FirebaseOptions(contentsOfFile: path) {
            FirebaseApp.configure(options: options)
            isFirebaseConfigured = true
        } else {
            isFirebaseConfigured = false
        }
#else
        isFirebaseConfigured = false
#endif
    }

    private func observeAuthState() {
#if canImport(FirebaseAuth)
        authListener = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor in
                guard let self else { return }
                if user != nil {
                    self.mode = .authenticated
                    self.authModeRaw = Mode.authenticated.rawValue
                } else if self.authModeRaw == Mode.guest.rawValue {
                    self.mode = .guest
                } else {
                    self.mode = .signedOut
                }
                self.isLoading = false
            }
        }
#else
        mode = Mode(rawValue: authModeRaw) ?? .signedOut
        isLoading = false
#endif
    }

#if canImport(FirebaseAuth)
    private func signInWithEmail(email: String, password: String) async throws {
        try await withCheckedThrowingContinuation { continuation in
            Auth.auth().signIn(withEmail: email, password: password) { _, error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }

    private func createUser(email: String, password: String) async throws {
        try await withCheckedThrowingContinuation { continuation in
            Auth.auth().createUser(withEmail: email, password: password) { _, error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }

    private func deleteUser(_ user: User) async throws {
        try await withCheckedThrowingContinuation { continuation in
            user.delete { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }

    private func signInWithApple(idTokenString: String, nonce: String) async {
        errorMessage = nil
        guard isFirebaseConfigured else {
            errorMessage = "Firebase is not configured."
            return
        }
        let credential = OAuthProvider.credential(withProviderID: "apple.com", idToken: idTokenString, rawNonce: nonce)
        do {
            try await withCheckedThrowingContinuation { continuation in
                Auth.auth().signIn(with: credential) { _, error in
                    if let error {
                        continuation.resume(throwing: error)
                    } else {
                        continuation.resume()
                    }
                }
            }
            authModeRaw = Mode.authenticated.rawValue
            mode = .authenticated
        } catch {
            errorMessage = error.localizedDescription
        }
    }
#else
    private func signInWithApple(idTokenString: String, nonce: String) async {
        errorMessage = "Firebase Auth is unavailable."
    }
#endif

    private func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashed = SHA256.hash(data: inputData)
        return hashed.compactMap { String(format: "%02x", $0) }.joined()
    }

    private func randomNonceString(length: Int = 32) -> String {
        let charset: [Character] =
            Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remainingLength = length

        while remainingLength > 0 {
            var randomBytes = [UInt8](repeating: 0, count: 16)
            let status = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
            if status != errSecSuccess {
                fatalError("Unable to generate nonce.")
            }

            randomBytes.forEach { random in
                if remainingLength == 0 {
                    return
                }
                if Int(random) < charset.count {
                    result.append(charset[Int(random)])
                    remainingLength -= 1
                }
            }
        }

        return result
    }
}
