import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var settings: Gate2GoSettings
    @State private var currentPage = 0
    
    private let pages: [(icon: String, title: String, description: String)] = [
        ("square.grid.2x2", "Design Beautiful Gates", "Choose from 6 professional gate styles and 4 materials to create the perfect gate for any property."),
        ("slider.horizontal.3", "Customize Every Detail", "Adjust dimensions, add finials, choose arch styles, and preview your design in real-time."),
        ("doc.richtext", "Generate Proposals", "Create branded PDF proposals with pricing breakdowns to share with your clients instantly.")
    ]
    
    var body: some View {
        VStack(spacing: 0) {
            TabView(selection: $currentPage) {
                ForEach(0..<pages.count, id: \.self) { index in
                    VStack(spacing: 24) {
                        Spacer()
                        
                        Image(systemName: pages[index].icon)
                            .font(.system(size: 80))
                            .foregroundStyle(.blue)
                        
                        Text(pages[index].title)
                            .font(.title.bold())
                        
                        Text(pages[index].description)
                            .font(.body)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 40)
                        
                        Spacer()
                    }
                    .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .always))
            
            VStack(spacing: 16) {
                Button(action: {
                    if currentPage < pages.count - 1 {
                        withAnimation {
                            currentPage += 1
                        }
                    } else {
                        settings.hasCompletedOnboarding = true
                    }
                }) {
                    Text(currentPage == pages.count - 1 ? "Get Started" : "Continue")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                
                if currentPage < pages.count - 1 {
                    Button("Skip") {
                        settings.hasCompletedOnboarding = true
                    }
                    .foregroundStyle(.secondary)
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
        }
    }
}

#Preview {
    OnboardingView()
        .environmentObject(Gate2GoSettings())
}
