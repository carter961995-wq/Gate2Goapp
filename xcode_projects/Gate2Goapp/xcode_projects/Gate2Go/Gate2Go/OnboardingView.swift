//
//  OnboardingView.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/18/26.
//

import SwiftUI

struct OnboardingPage: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let subtitle: String
}

struct OnboardingView: View {
    @EnvironmentObject private var settings: Gate2GoSettings
    @State private var currentPage = 0
    
    private let pages: [OnboardingPage] = [
        OnboardingPage(
            icon: "square.grid.2x2.fill",
            title: "Design Any Gate",
            subtitle: "Choose from 6 gate styles and 4 materials. Customize dimensions, add-ons, and see live previews."
        ),
        OnboardingPage(
            icon: "dollarsign.circle.fill",
            title: "Accurate Pricing",
            subtitle: "Calculate costs with markup, labor, and tax. Generate professional proposals for your clients."
        ),
        OnboardingPage(
            icon: "doc.text.fill",
            title: "Win More Jobs",
            subtitle: "Create branded PDF proposals with your company logo. Share instantly with clients."
        )
    ]
    
    var body: some View {
        VStack(spacing: 0) {
            TabView(selection: $currentPage) {
                ForEach(Array(pages.enumerated()), id: \.element.id) { index, page in
                    VStack(spacing: 24) {
                        Spacer()
                        
                        Image(systemName: page.icon)
                            .font(.system(size: 80))
                            .foregroundStyle(.blue)
                            .padding(.bottom, 16)
                        
                        Text(page.title)
                            .font(.largeTitle.bold())
                            .multilineTextAlignment(.center)
                        
                        Text(page.subtitle)
                            .font(.body)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                        
                        Spacer()
                        Spacer()
                    }
                    .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            
            VStack(spacing: 20) {
                HStack(spacing: 8) {
                    ForEach(0..<pages.count, id: \.self) { index in
                        Circle()
                            .fill(index == currentPage ? Color.blue : Color.gray.opacity(0.3))
                            .frame(width: 8, height: 8)
                    }
                }
                
                Button {
                    if currentPage < pages.count - 1 {
                        withAnimation {
                            currentPage += 1
                        }
                    } else {
                        settings.hasCompletedOnboarding = true
                    }
                } label: {
                    Text(currentPage == pages.count - 1 ? "Get Started" : "Continue")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                }
                .buttonStyle(.borderedProminent)
                .padding(.horizontal, 24)
                
                if currentPage < pages.count - 1 {
                    Button("Skip") {
                        settings.hasCompletedOnboarding = true
                    }
                    .foregroundStyle(.secondary)
                }
            }
            .padding(.bottom, 40)
        }
    }
}

#Preview {
    OnboardingView()
        .environmentObject(Gate2GoSettings())
}
