import React, { useState, useRef, useEffect } from 'react'
import { View, Modal, StyleSheet, TouchableOpacity, Text, Animated, Easing, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'

export interface HelpKitOptions {
  headerTitle?: string | (() => string)
  version?: string
  debug?: boolean
  // For internal use - populated by setContactFields()
  contactFields?: ContactFields
  // For internal testing only - not for production use
  _internalDomain?: string
}

export interface ContactFields {
  name?: string
  email?: string
  subject?: string
  metadata?: string
}

type HelpKitPath = { type: 'home' } | { type: 'article'; id: string } | { type: 'category'; id: string } | { type: 'contact' }

// Logging utility function
const logDebug = (message: string, options?: HelpKitOptions) => {
  if (options?.debug) {
    console.log(`[HelpKit SDK] ${message}`)
  }
}

class HelpKitManager {
  static instance: HelpKitManager | null = null
  private version: string | null = null
  private projectId: string | null = null
  private listener: ((visible: boolean, path?: HelpKitPath, options?: HelpKitOptions) => void) | null = null
  private debugMode: boolean = false
  private _contactFields: Record<string, any> = {}

  static getInstance(): HelpKitManager {
    if (!HelpKitManager.instance) {
      HelpKitManager.instance = new HelpKitManager()

      console.log('[HelpKit SDK] Successfully initiated')
      logDebug('Instance created with debug logging', { debug: true })
    }
    return HelpKitManager.instance
  }

  setProject(projectId: string) {
    logDebug(`Setting project: ${projectId}`, { debug: this.debugMode })
    this.projectId = projectId
  }

  setVersion(version: string) {
    logDebug(`Setting version: ${version}`, { debug: this.debugMode })
    this.version = version
  }

  setDebugMode(enabled: boolean) {
    this.debugMode = enabled
    logDebug(`Debug mode ${enabled ? 'enabled' : 'disabled'}`, { debug: true })
  }

  setListener(callback: (visible: boolean, path?: HelpKitPath, options?: HelpKitOptions) => void) {
    logDebug('Setting listener', { debug: this.debugMode })
    this.listener = callback
    return () => {
      logDebug('Removing listener', { debug: this.debugMode })
      this.listener = null
    }
  }

  // Simplified open methods
  open(options: HelpKitOptions = {}) {
    const mergedOptions = {
      ...options,
      debug: options.debug || this.debugMode,
    }
    logDebug('Opening home view', mergedOptions)
    this.listener?.(true, { type: 'home' }, mergedOptions)
  }

  openArticle(articleId: string, options: HelpKitOptions = {}) {
    const mergedOptions = { ...options, debug: options.debug || this.debugMode }
    logDebug(`Opening article: ${articleId}`, mergedOptions)
    this.listener?.(true, { type: 'article', id: articleId }, mergedOptions)
  }

  openCategory(categoryId: string, options: HelpKitOptions = {}) {
    const mergedOptions = { ...options, debug: options.debug || this.debugMode }
    logDebug(`Opening category: ${categoryId}`, mergedOptions)
    this.listener?.(true, { type: 'category', id: categoryId }, mergedOptions)
  }

  openContact(options: HelpKitOptions = {}) {
    const mergedOptions = { ...options, debug: options.debug || this.debugMode }
    logDebug('Opening contact view', mergedOptions)
    this.listener?.(true, { type: 'contact' }, mergedOptions)
  }

  close() {
    logDebug('Closing HelpKit', { debug: this.debugMode })
    this.listener?.(false)
  }

  getVersion(): string | null {
    return this.version
  }

  getProjectId(): string | null {
    return this.projectId
  }

  getContactFields(): Record<string, any> | undefined {
    return Object.keys(this._contactFields).length > 0 ? this._contactFields : undefined
  }

  setContactFields(contactFields: ContactFields) {
    logDebug(`Setting contact fields: ${JSON.stringify(contactFields)}`, { debug: this.debugMode })

    // Validate form fields
    if (typeof contactFields !== 'object' || contactFields === null) {
      console.error('[HelpKit SDK] Invalid contact fields: Expected an object.')
      return
    }

    const validFields = ['name', 'email', 'subject', 'metadata']
    const updatedFields: ContactFields = {}

    // Iterate over provided fields and validate
    for (const [key, value] of Object.entries(contactFields)) {
      if (!validFields.includes(key)) {
        logDebug(`Skipping invalid field "${key}"`, { debug: this.debugMode })
        continue
      }

      // Check if value is string (redundant with TypeScript, but good for runtime safety)
      if (typeof value !== 'string') {
        console.error(`[HelpKit SDK] Invalid form field: "${key}" must be a string.`)
        continue
      }

      // Add valid field to the update
      updatedFields[key as keyof ContactFields] = value
    }

    // Store the validated fields
    if (Object.keys(updatedFields).length > 0) {
      this._contactFields = updatedFields
      logDebug(`Contact fields saved: ${JSON.stringify(updatedFields)}`, { debug: this.debugMode })

      // Notify listener if available
      if (this.listener) {
        logDebug(`Notifying listener about contact fields update`, { debug: this.debugMode })
        this.listener(false, undefined, { contactFields: updatedFields, debug: this.debugMode })
      }
    } else {
      logDebug('No valid contact fields to update', { debug: this.debugMode })
    }
  }
}

export const HelpKitSDK = HelpKitManager.getInstance()

interface HelpKitProps {
  projectId: string
  config?: HelpKitOptions
}

export default function HelpKit({ projectId, config = {} }: HelpKitProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const [path, setPath] = useState<HelpKitPath>({ type: 'home' })
  const [options, setOptions] = useState<HelpKitOptions>(config)
  const [canGoBack, setCanGoBack] = useState(false)
  const [loading, setLoading] = useState(true)
  const webViewRef = useRef<WebView>(null)
  const spinAnimation = useRef(new Animated.Value(0)).current
  const shimmerAnimation = useRef(new Animated.Value(0)).current
  const [webViewReady, setWebViewReady] = useState(false)
  const [initialUrlLoaded, setInitialUrlLoaded] = useState(false)

  // Store current state values in refs to avoid dependency issues
  const optionsRef = useRef(options)
  const webViewReadyRef = useRef(webViewReady)
  const modalVisibleRef = useRef(modalVisible)

  // Update refs when state changes
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    webViewReadyRef.current = webViewReady
  }, [webViewReady])

  useEffect(() => {
    modalVisibleRef.current = modalVisible
  }, [modalVisible])

  // Setup the animation
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinAnimation, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start()
    } else {
      spinAnimation.setValue(0)
    }
  }, [loading, spinAnimation])

  // Create the spinning animation interpolation
  const spin = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  // Setup the shimmer animation
  useEffect(() => {
    if (loading) {
      // Create a loop animation for the shimmer effect
      Animated.loop(
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start()
    } else {
      shimmerAnimation.setValue(0)
    }
  }, [loading])

  // Create the interpolation for the shimmer effect
  const shimmerTranslate = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  })

  // Function to apply shimmer to a skeleton component
  const getShimmerStyle = () => {
    return {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'white',
      opacity: 0.3,
      transform: [{ translateX: shimmerTranslate }],
    }
  }

  const postMessageToWebView = (message: any) => {
    logDebug('Posting message to WebView: ', message)
    if (!webViewRef.current) {
      logDebug('Cannot post message: WebView reference is null', optionsRef.current)
      return
    }

    let messageString: string
    if (typeof message === 'string') {
      messageString = message
    } else {
      try {
        // For objects, we'll create a simpler format that's easier to parse
        if (message.type === 'helpkit-setContactFields' && message.contactFields) {
          // Create a special format string that the bridge will recognize and parse correctly
          messageString = `HELPKIT_CONTACT_FIELDS:${JSON.stringify(message.contactFields)}`
        } else {
          messageString = JSON.stringify(message)
        }
      } catch (e) {
        messageString = String(message)
      }
    }

    logDebug(`Posting message to WebView: ${messageString}`, optionsRef.current)

    try {
      webViewRef.current.postMessage(messageString)
      logDebug('Message posted successfully', optionsRef.current)
    } catch (error) {
      console.error('[HelpKit SDK] Error posting message to WebView:', error)
    }
  }

  // Effect to handle sending stored contact fields when WebView is ready - use refs
  useEffect(() => {
    if (webViewReady && modalVisible && options.contactFields) {
      logDebug('WebView ready and modal visible - sending contact fields', optionsRef.current)
      const contactFieldsMessage = {
        type: 'helpkit-setContactFields',
        contactFields: options.contactFields,
      }
      postMessageToWebView(contactFieldsMessage)
    }
  }, [webViewReady, modalVisible, options.contactFields])

  // Setup only once on mount
  useEffect(() => {
    logDebug(`HelpKit component mounted with projectId: ${projectId}`, config)
    HelpKitSDK.setProject(projectId)
    HelpKitSDK.setDebugMode(config.debug === true)

    // Get any existing contact fields when component mounts
    const savedContactFields = HelpKitSDK.getContactFields()
    if (savedContactFields) {
      logDebug(`Retrieved saved contact fields on mount: ${JSON.stringify(savedContactFields)}`, config)
      setOptions((prev) => ({ ...prev, contactFields: savedContactFields }))
    }

    // Create listener once for the component lifecycle
    const listenerCallback = (visible: boolean, newPath?: HelpKitPath, newOptions?: HelpKitOptions) => {
      if (visible) {
        // Show modal and navigate to specified path
        logDebug(`Showing modal with path: ${JSON.stringify(newPath)}, options: ${JSON.stringify(newOptions)}`, config)

        // Merge all options, ensuring contactFields are included
        const mergedOptions = {
          ...config,
          ...newOptions,
          // Ensure contactFields are preserved
          contactFields: newOptions?.contactFields || optionsRef.current.contactFields || HelpKitSDK.getContactFields(),
        }

        logDebug(`Using merged options: ${JSON.stringify(mergedOptions)}`, config)
        setPath(newPath || { type: 'home' })
        setOptions(mergedOptions)
        setModalVisible(true)
      } else if (newOptions?.contactFields) {
        logDebug(`Received contact field update without changing visibility`, config)

        // Only update options to include the new contact fields
        setOptions((prevOptions) => ({ ...prevOptions, contactFields: newOptions.contactFields }))

        // Use refs to check current state
        if (webViewReadyRef.current && modalVisibleRef.current && webViewRef.current) {
          const contactFieldsMessage = {
            type: 'helpkit-setContactFields',
            contactFields: newOptions.contactFields,
          }
          postMessageToWebView(contactFieldsMessage)
        } else {
          logDebug('WebView not ready or modal not visible - contact fields will be sent when ready', config)
        }
      } else {
        // Regular hide action
        logDebug('Hiding modal', config)
        setModalVisible(false)
      }
    }

    // Set the listener only once during component mount
    const unsubscribe = HelpKitSDK.setListener(listenerCallback)

    return unsubscribe
  }, [projectId]) // Only depend on projectId, not config to avoid recreation

  const getHelpKitUrl = (): string => {
    const withAI = false

    // Use the version from manager if available, otherwise from component options
    const version = HelpKitSDK.getVersion() || options.version

    const protocol = 'https'
    // Use internal domain if provided, otherwise default to production
    const domain = options._internalDomain || 'helpkit.so'
    const versionPath = version ? `/${version}` : ''

    let pagePath = ''
    if (path.type === 'article') {
      pagePath = `/categoryName/categoryId/articleName/${path.id}`
    } else if (path.type === 'category') {
      pagePath = `/categoryName/${path.id}`
    } else if (path.type === 'contact') {
      pagePath = '/contact'
    }

    const baseUrl = `${protocol}://${projectId}.${domain}${versionPath}${pagePath}`
    const params = new URLSearchParams({ app: 'true' })

    if (withAI) {
      params.append('ai', 'true')
    }

    const finalUrl = `${baseUrl}?${params}`
    logDebug(`Generated URL: ${finalUrl}`, options)
    return finalUrl
  }

  const handleBack = (): void => {
    logDebug('Navigating back', options)
    if (webViewRef.current) {
      webViewRef.current.goBack()
    }
  }

  const onNavigationStateChange = (navState: { canGoBack: boolean; url: string }): void => {
    logDebug(`Navigation state changed: ${navState.url}`, options)
    // Update the back navigation state
    setCanGoBack(navState.canGoBack)

    // Android-specific fix: Clear loading state after navigation changes
    // This prevents the skeleton from getting stuck on navigation
    if (Platform.OS === 'android' && initialUrlLoaded) {
      logDebug('Android navigation - ensuring loading state is cleared', options)
      setLoading(false)
    }
  }

  // Bridge script to intercept window.parent.postMessage calls and redirect them to ReactNativeWebView
  const injectedJavaScriptBridge = `
    (function() {
      console.log("[HelpKit Bridge] Initializing message bridge");
      
      // Debug function to log to console and try to send to React Native
      function debugLog(message) {
        console.log("[HelpKit Bridge]", message);
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage("DEBUG: " + message);
        }
      }
      
      // Store the original postMessage function
      const originalPostMessage = window.parent.postMessage;
      
      // Process incoming messages from React Native
      window.addEventListener('message', function(event) {
        const data = event.data;
        debugLog("Raw message received: " + data);
        
        // Special handling for our contact fields format
        if (typeof data === 'string' && data.startsWith('HELPKIT_CONTACT_FIELDS:')) {
          try {
            const contactFieldsJson = data.substring('HELPKIT_CONTACT_FIELDS:'.length);
            const contactFields = JSON.parse(contactFieldsJson);
            
            debugLog("Parsed contact fields: " + JSON.stringify(contactFields));
            
            // Forward the correctly formatted object to the app
            const formattedMessage = {
              type: 'helpkit-setContactFields',
              contactFields: contactFields
            };
            
            // Use the original postMessage to send to the Nuxt app
            originalPostMessage.call(window.parent, formattedMessage, '*');
            debugLog("Sent formatted contact fields to app");
            
            // Prevent further processing
            event.stopPropagation();
            return;
          } catch (e) {
            debugLog("Error parsing contact fields: " + e);
          }
        }
      });
      
      // Keep track of messages we've already processed to avoid echoes
      const processedMessages = new Set();
      
      // Intercept all calls to window.parent.postMessage
      window.parent.postMessage = function(message, targetOrigin) {
        // Create a message ID to track duplicates
        const messageId = typeof message === 'string' ? message : JSON.stringify(message);
        
        // Skip if we've already processed this exact message recently
        if (processedMessages.has(messageId)) {
          debugLog("Skipping duplicate message: " + messageId.substring(0, 100));
          return;
        }
        
        // Add to processed set and remove after a short delay
        processedMessages.add(messageId);
        setTimeout(() => processedMessages.delete(messageId), 500);
        
        debugLog("Intercepted postMessage: " + messageId.substring(0, 100));
        
        // Forward to ReactNativeWebView.postMessage if it exists
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          try {
            window.ReactNativeWebView.postMessage(message);
            debugLog("Successfully forwarded message to ReactNativeWebView");
          } catch (error) {
            debugLog("Error forwarding message: " + error);
            // Fall back to the original if there was an error
            originalPostMessage.call(window.parent, message, targetOrigin);
          }
        } else {
          debugLog("ReactNativeWebView not available, using original postMessage");
          // Fall back to the original if ReactNativeWebView is not available
          originalPostMessage.call(window.parent, message, targetOrigin);
        }
      };
      
      // Manually send a test message
      setTimeout(function() {
        debugLog("Sending test message");
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage("helpkit-test-message");
        }
        
        // Also try to send the expected widget loaded message
        const projectId = "${projectId}";
        window.ReactNativeWebView.postMessage("helpkit-widget-loaded--" + projectId);
      }, 2000);
      
      // Let React Native know our bridge is ready
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage("bridge-ready");
      }
      
      // Add a MutationObserver to detect when the body is fully loaded
      if (typeof MutationObserver !== 'undefined') {
        debugLog("Setting up MutationObserver");
        const observer = new MutationObserver(function(mutations) {
          const appElement = document.getElementById('app') || document.querySelector('.app');
          if (appElement) {
            debugLog("App element found, widget appears to be loaded");
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              const projectId = "${projectId}";
              window.ReactNativeWebView.postMessage("helpkit-widget-loaded--" + projectId);
              debugLog("Sent widget loaded message");
            }
            observer.disconnect();
          }
        });
        
        // Start observing
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }
      
      // Handle special WebView-to-RN message types differently to avoid echoes
      const isRNOnlyMessage = function(data) {
        if (typeof data === 'string') {
          return data.startsWith('helpkit-widget-loaded--') || 
                 data === 'bridge-ready' || 
                 data === 'helpkit-test-message';
        }
        return false;
      };
      
      // Also listen for explicit ready signals from the widget
      window.addEventListener('message', function(event) {
        const eventData = event.data;
        debugLog("Window message event received: " + (typeof eventData === 'string' ? eventData : JSON.stringify(eventData)));
        
        // If it's our widget's ready message or another RN-only message, forward directly and don't process normally
        if (isRNOnlyMessage(eventData)) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(eventData);
            debugLog("Forwarded special message type");
          }
          // Stop propagation for these special messages
          event.stopPropagation();
          return;
        }
      }, true); // Capture phase to intercept early
      
      true; // Required return value for injectedJavaScript
    })();
  `

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
      <View style={styles.container}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            {canGoBack ? (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
            <Text style={styles.headerTitle}>
              {typeof options.headerTitle === 'function' ? options.headerTitle() : options.headerTitle || 'Help Center'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <WebView
          ref={webViewRef}
          source={{ uri: getHelpKitUrl() }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onNavigationStateChange={onNavigationStateChange}
          injectedJavaScript={injectedJavaScriptBridge}
          onLoadStart={(event) => {
            // Only show loading indicator on initial page load
            // Android has different behavior than iOS for internal navigation
            if (!initialUrlLoaded) {
              logDebug('Initial load - showing skeleton', options)
              setLoading(true)
            } else if (Platform.OS !== 'android') {
              // For iOS, we can use the normal behavior
              setLoading(true)
            }
          }}
          onLoad={() => {
            logDebug('WebView onLoad event fired', options)
          }}
          onLoadEnd={() => {
            logDebug('WebView onLoadEnd event fired', options)
            setLoading(false)
            setInitialUrlLoaded(true)

            // Android-specific fix: Add extra safety to ensure loading state is cleared
            if (Platform.OS === 'android') {
              setTimeout(() => setLoading(false), 100)
            }
          }}
          onError={(error) => {
            console.error('[HelpKit SDK] WebView error:', error.nativeEvent)
          }}
          onHttpError={(error) => {
            console.error('[HelpKit SDK] WebView HTTP error:', error.nativeEvent)
          }}
          onMessage={(event) => {
            logDebug(`Message from WebView: ${event.nativeEvent.data}`, options)

            // For debugging messages
            if (typeof event.nativeEvent.data === 'string' && event.nativeEvent.data.startsWith('DEBUG:')) {
              logDebug(`WebView debug: ${event.nativeEvent.data.substring(6)}`, options)
              return
            }

            // Handle test message
            if (event.nativeEvent.data === 'helpkit-test-message') {
              logDebug('Received test message - communication working', options)

              // Since we got a test message, we know communication works
              // Let's simulate the widget loaded message if we haven't received it naturally
              if (!webViewReady) {
                logDebug('Test message received but widget not ready yet - forcing ready state', options)
                setWebViewReady(true)

                // Send contact fields if we have them
                if (options.contactFields) {
                  const contactFieldsMessage = {
                    type: 'helpkit-setContactFields',
                    contactFields: options.contactFields,
                  }
                  postMessageToWebView(contactFieldsMessage)
                }
              }
              return
            }

            // Check for the exact widget loaded message format
            const widgetLoadedMessage = `helpkit-widget-loaded--${projectId}`
            if (event.nativeEvent.data === widgetLoadedMessage) {
              logDebug('Received widget loaded signal from WebView', options)
              setWebViewReady(true)

              // If there are contact fields in options, send them now
              if (options.contactFields) {
                logDebug(`WebView signaled ready - sending pending contact fields: ${JSON.stringify(options.contactFields)}`, options)
                const contactFieldsMessage = {
                  type: 'helpkit-setContactFields',
                  contactFields: options.contactFields,
                }
                postMessageToWebView(contactFieldsMessage)
              } else {
                logDebug('No contact fields to send after WebView ready signal', options)
              }
              return
            }

            // Try to parse other messages from WebView
            try {
              const message = JSON.parse(event.nativeEvent.data)
              if (message.type === 'webview-ready') {
                logDebug('Received explicit ready signal from WebView', options)
                setWebViewReady(true)

                // If there are contact fields in options, send them immediately on explicit ready
                if (options.contactFields) {
                  const contactFieldsMessage = {
                    type: 'helpkit-setContactFields',
                    contactFields: options.contactFields,
                  }
                  postMessageToWebView(contactFieldsMessage)
                }
              }
            } catch (e) {
              // Not JSON or other error
              logDebug(`Non-JSON message from WebView: ${event.nativeEvent.data}`, options)
            }
          }}
          allowsBackForwardNavigationGestures={true}
        />

        {/* Custom skeleton loader overlay */}
        {loading && (
          <View style={styles.skeletonOverlay}>
            <View style={styles.skeletonHeader}>
              <View style={styles.skeletonHeaderText}>
                <Animated.View style={getShimmerStyle()} />
              </View>
            </View>

            <View style={styles.skeletonSearchContainer}>
              <View style={styles.skeletonSearchBar}>
                <Animated.View style={getShimmerStyle()} />
              </View>
            </View>

            <View style={styles.skeletonCategoriesTitle}>
              <Animated.View style={getShimmerStyle()} />
            </View>

            {[1, 2, 3, 4].map((_, index) => (
              <View key={index} style={styles.skeletonCard}>
                <View style={styles.skeletonIcon}>
                  <Animated.View style={getShimmerStyle()} />
                </View>
                <View style={styles.skeletonTextContainer}>
                  <View style={styles.skeletonTitle}>
                    <Animated.View style={getShimmerStyle()} />
                  </View>
                  <View style={styles.skeletonDescription}>
                    <Animated.View style={getShimmerStyle()} />
                  </View>
                  <View style={styles.skeletonArticleCount}>
                    <Animated.View style={getShimmerStyle()} />
                  </View>
                </View>
                <Animated.View style={[getShimmerStyle(), { opacity: 0.05 }]} />
              </View>
            ))}
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'rgba(248, 249, 250, 0.5)',
    zIndex: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 1,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '500',
  },
  placeholder: {
    width: 32,
  },
  webView: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    width: 32,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f6f7f9',
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  skeletonHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  skeletonHeaderText: {
    width: 220,
    height: 32,
    backgroundColor: '#e0e0e6',
    borderRadius: 6,
  },
  skeletonSearchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 30,
  },
  skeletonSearchBar: {
    width: '100%',
    height: 44,
    backgroundColor: '#e0e0e6',
    borderRadius: 8,
  },
  skeletonCategoriesTitle: {
    width: 150,
    height: 24,
    backgroundColor: '#e0e0e6',
    borderRadius: 6,
    marginBottom: 20,
  },
  skeletonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e0e0e6',
    marginRight: 16,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonTitle: {
    width: '60%',
    height: 20,
    backgroundColor: '#e0e0e6',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonDescription: {
    width: '90%',
    height: 16,
    backgroundColor: '#e0e0e6',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonArticleCount: {
    width: '30%',
    height: 14,
    backgroundColor: '#e0e0e6',
    borderRadius: 4,
  },
  skeletonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f6f7f9',
    paddingHorizontal: 16,
    paddingTop: 60,
    zIndex: 10,
  },
})
