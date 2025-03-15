import { StyleSheet } from 'react-native'
import { Text, View } from '@/components/Themed'
import { Image } from 'react-native'
import { ScrollView } from 'react-native'

export default function TabTwoScreen() {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Why Choose HelpKit?</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

        <Text style={styles.tagline}>Turn your Notion docs into a professional help center for your mobile app</Text>

        <View style={styles.featureContainer}>
          <Text style={styles.featureTitle}>📱 Mobile-Optimized Experience</Text>
          <Text style={styles.featureText}>
            Designed specifically for mobile apps with blazingly fast performance and responsive layouts. Loads up to 10x faster than default Notion
            pages.
          </Text>
        </View>

        <View style={styles.featureContainer}>
          <Text style={styles.featureTitle}>🙅 Not Another Tool to Learn</Text>
          <Text style={styles.featureText}>
            Use Notion to write your help articles. Your content stays in Notion with real-time collaboration and automatic updates.
          </Text>
        </View>

        <View style={styles.featureContainer}>
          <Text style={styles.featureTitle}>🎨 Fully Customizable</Text>
          <Text style={styles.featureText}>
            Tailor your help center to match your brand with custom colors, logos, and layouts. Create a seamless experience that feels native to your
            app.
          </Text>
        </View>

        <View style={styles.featureContainer}>
          <Text style={styles.featureTitle}>📊 Powerful Analytics</Text>
          <Text style={styles.featureText}>
            Track which articles are most viewed, search queries, and user feedback to continuously improve your help content and reduce support
            tickets.
          </Text>
        </View>

        <View style={styles.featureContainer}>
          <Text style={styles.featureTitle}>🔍 Smart Search</Text>
          <Text style={styles.featureText}>
            Help customers find what they need with powerful full-text search. Reduce support tickets and get customers to answers quickly.
          </Text>
        </View>

        <View style={styles.featureContainer}>
          <Text style={styles.featureTitle}>🤖 AI Chat Assistant</Text>
          <Text style={styles.featureText}>
            Enhance support with an AI chat assistant trained on your help articles. Provide instant, accurate answers 24/7 without human
            intervention.
          </Text>
        </View>

        <View style={styles.featureContainer}>
          <Text style={styles.featureTitle}>⚡ Easy Setup, Amazing Results</Text>
          <Text style={styles.featureText}>
            "With HelpKit we literally went from 0 to fully functional knowledge base in 1 hour." - Dan Kelly, CEO
          </Text>
        </View>

        <View style={styles.featureContainer}>
          <Text style={styles.featureTitle}>🌐 Custom Domain & SEO</Text>
          <Text style={styles.featureText}>
            Use your own domain like support.yourbrand.com and get optimized SEO so customers find your help articles easily.
          </Text>
        </View>

        <View style={styles.featureContainer}>
          <Text style={styles.featureTitle}>🌍 Multiple Versions & Languages</Text>
          <Text style={styles.featureText}>
            Support different product versions and languages with ease. Create localized help content to serve your global user base from a single
            platform.
          </Text>
        </View>

        <View style={styles.companiesContainer}>
          <Text style={styles.companiesTitle}>Trusted by 350+ companies:</Text>
          <Text style={styles.companiesText}>Railway.app • Opalcamera.com • Arrows.to • MIT • Versapay.com • Softr.io</Text>
        </View>

        <View style={styles.ctaContainer}>
          <Text style={styles.ctaText}>Start your 7-day free trial today!</Text>
          <Text style={styles.ctaSubtext}>No credit card required • 24/7 support</Text>
          <Text style={styles.ctaSubtext}>www.helpkit.so</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
  tagline: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 25,
    color: '#9067EE',
    paddingHorizontal: 10,
  },
  featureContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    lineHeight: 22,
  },
  companiesContainer: {
    marginVertical: 25,
    width: '100%',
    alignItems: 'center',
  },
  companiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  companiesText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  ctaContainer: {
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9067EE',
  },
  ctaSubtext: {
    fontSize: 14,
    marginTop: 5,
    color: '#666',
  },
})
