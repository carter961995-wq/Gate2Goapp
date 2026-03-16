import SwiftUI
import AuthenticationServices

struct AuthView: View {
    @EnvironmentObject private var authManager: AuthManager

    @State private var email: String = ""
    @State private var password: String = ""
    @State private var confirmPassword: String = ""
    @State private var isCreatingAccount: Bool = false
    @State private var isWorking: Bool = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Spacer()

                VStack(spacing: 6) {
                    Text("Welcome to Gate2Go")
                        .font(.title.bold())
                    Text("Sign in to save your settings. You can also continue as a guest.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }

                if !authManager.isFirebaseConfigured {
                    Text("Firebase is not configured. Add GoogleService-Info.plist to enable sign-in.")
                        .font(.caption)
                        .foregroundStyle(.orange)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                VStack(spacing: 12) {
                    TextField("Email", text: $email)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .textContentType(.emailAddress)
                        .autocorrectionDisabled()
                        .textFieldStyle(.roundedBorder)

                    SecureField("Password", text: $password)
                        .textContentType(isCreatingAccount ? .newPassword : .password)
                        .textFieldStyle(.roundedBorder)

                    if isCreatingAccount {
                        SecureField("Confirm Password", text: $confirmPassword)
                            .textContentType(.newPassword)
                            .textFieldStyle(.roundedBorder)
                    }
                }

                if let errorMessage = authManager.errorMessage {
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                Button {
                    Task { await handlePrimaryAction() }
                } label: {
                    if isWorking {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    } else {
                        Text(isCreatingAccount ? "Create Account" : "Sign In")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(isWorking || !canSubmit)

                SignInWithAppleButton(.signIn) { request in
                    authManager.prepareAppleRequest(request)
                } onCompletion: { result in
                    authManager.handleAppleCompletion(result)
                }
                .signInWithAppleButtonStyle(.black)
                .frame(height: 44)
                .disabled(!authManager.isFirebaseConfigured)

                Button {
                    authManager.continueAsGuest()
                } label: {
                    Text("Continue as Guest")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button {
                    isCreatingAccount.toggle()
                } label: {
                    Text(isCreatingAccount ? "Already have an account? Sign In" : "New here? Create an account")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }

                Spacer()
            }
            .padding()
            .navigationBarHidden(true)
        }
    }

    private var canSubmit: Bool {
        let trimmed = email.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !password.isEmpty else { return false }
        if isCreatingAccount {
            return password == confirmPassword
        }
        return true
    }

    private func handlePrimaryAction() async {
        guard !isWorking else { return }
        isWorking = true
        defer { isWorking = false }

        if isCreatingAccount {
            await authManager.signUp(email: email, password: password)
        } else {
            await authManager.signIn(email: email, password: password)
        }
    }
}

#Preview {
    AuthView()
        .environmentObject(AuthManager())
}
