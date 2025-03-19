import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { HelpKitSDK } from '@helpkit/helpkit-help-center-react-native'
import Octicons from '@expo/vector-icons/Octicons'

interface SettingItemProps {
  title: string
  icon: string
  onPress: () => void
  description?: string
  note?: string
}

const SettingItem: React.FC<SettingItemProps> = ({ title, icon, onPress, description, note }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingItemContent}>
      <Octicons name={icon as any} size={22} color="#A773EB" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
        {note && <Text style={styles.settingNote}>{note}</Text>}
      </View>
    </View>
    <Octicons name="chevron-right" size={20} color="#777" />
  </TouchableOpacity>
)

export default function TabOneScreen() {
  const openHelpKit = () => {
    HelpKitSDK.open()
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionHeader}>Support</Text>
      <View style={styles.section}>
        <SettingItem
          title="Help Center"
          icon="question"
          description="Open the help center"
          note="HelpKitSDK.open()"
          onPress={() => HelpKitSDK.open()}
        />
        <SettingItem
          title="Contact Us"
          icon="mail"
          description="Open contact us form"
          note="HelpKitSDK.openContact()"
          onPress={() => HelpKitSDK.openContact()}
        />
        <SettingItem
          title="Open Help Article"
          icon="repo"
          description="Directly open an help article"
          note="HelpKitSDK.openArticle('HK_Article_Id')"
          onPress={() => HelpKitSDK.openArticle('4pXKV6QwyrKzbUepdxipfz')}
        />
        <SettingItem
          title="Open Help Category"
          icon="repo-clone"
          description="Directly open an help category"
          note="HelpKitSDK.openContact('HK_Category_Id')"
          onPress={() => HelpKitSDK.openCategory('4pXKV6Qwyr4E7JwpKGYzCH')}
        />
        <SettingItem
          title="Switch to Different Version"
          icon="globe"
          description="Switch and open different version"
          note="HelpKitSDK.setVersion('HK_Version_Path_Name')"
          onPress={() => {
            HelpKitSDK.setVersion('de')
            HelpKitSDK.open()
          }}
        />
        <SettingItem
          title="Switch to Default Version"
          icon="globe"
          description="Switch and open different version"
          note="HelpKitSDK.setVersion('')"
          onPress={() => {
            HelpKitSDK.setVersion('')
            HelpKitSDK.open()
          }}
        />
        <SettingItem
          title="Prefill Contact Fields"
          icon="id-badge"
          description="Prefill contact form data"
          note="HelpKitSDK.setContactFields({name, email, subject, metadata})"
          onPress={() => {
            HelpKitSDK.setContactFields({
              name: 'John Doe',
              email: 'john@example.com',
              subject: 'Test: Support Request',
              metadata: JSON.stringify({
                platform: 'ios',
                version: '15.0',
                brand: 'Apple',
                model: 'iPhone',
                appVersion: '1.0.0',
                timestamp: '2023-07-20T14:30:45.123Z',
              }),
            })
            HelpKitSDK.openContact()
          }}
        />
      </View>

      {/* <Text style={styles.sectionHeader}>Account</Text>
      <View style={styles.section}>
        <SettingItem title="Profile" icon="person" onPress={() => {}} description="Edit your personal information" />
        <SettingItem title="Privacy" icon="lock-closed" onPress={() => {}} description="Control your data and privacy settings" />
        <SettingItem title="Sign Out" icon="log-out" onPress={() => {}} />
      </View> */}
      <View style={{ height: 50 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    paddingTop: 10,
    paddingBottom: 80,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#A773EB',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 16,
  },
  section: {
    backgroundColor: '#16292e',
    borderRadius: 10,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#25292e',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  settingDescription: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  settingNote: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 6,
    marginLeft: 2,
    fontFamily: 'Courier',
  },
  button: {
    backgroundColor: '#16292e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
})
