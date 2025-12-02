import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { View, Text, StyleSheet, StatusBar, Platform, TouchableOpacity, Image, Keyboard, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { GiftedChat, Bubble, InputToolbar, Composer } from 'react-native-gifted-chat';
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { ChatScreenProps } from "@navigation";
import { theme } from "@constants";
import { moderateScale } from "@utils/scaling";
import { Fonts } from "@constants/Fonts";
import SVG from "@assets/icons";
import * as SignalR from "@microsoft/signalr";
import { useInfiniteChatMessages, ChatMessage, mainService } from "@services/mainServices";
import { pickImage } from "@utils";
import ToastManager from "@components/common/ToastManager";
import { useImageUpload } from "../../hooks";
import { CHAT_HUB_URL } from "@services";

export const ChatScreen: React.FC<ChatScreenProps> = ({
    navigation,
    route,
}) => {
    const { itemDetails, memberId, teamId, team, userType } = route?.params as any ?? {};
    const [messages, setMessages] = useState([]);


    // Use refs for connection management to avoid unnecessary re-renders
    const connectionRef = useRef<SignalR.HubConnection | null>(null);
    const isConnectedRef = useRef(false);
    const isConnectingRef = useRef(false);
    const reconnectAttemptRef = useRef(0);

    // UI states
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [reportReason, setReportReason] = useState('');
    const [reportError, setReportError] = useState('');
    const [showMoreModal, setShowMoreModal] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    // Image selection state
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    // Fullscreen image viewer state
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [imageViewerUri, setImageViewerUri] = useState<string | null>(null);

    let keyboardDidShowListenerRef = useRef<any>(null);
    let keyboardDidHideListenerRef = useRef<any>(null);


    // Track if this screen is focused
    const isFocused = useIsFocused();

    // Add API call for fetching messages with pagination
    const { data: chatMessagesData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isLoadingMessages, error: messagesError, refetch: refetchMessages } = useInfiniteChatMessages(
        teamId || 46,
        memberId || 123,
        itemDetails?.threadId || 27,
        userType); // Pass userType to the hook

    const isMute = chatMessagesData?.pages?.[0]?.data?.data?.isMute;


    console.log("chatMessagesData", JSON.stringify(chatMessagesData?.pages?.[0]?.data?.data?.isMute));


    // Transform API messages to GiftedChat format
    const transformedMessages = useMemo(() => {
        if (!chatMessagesData?.pages || chatMessagesData.pages.length === 0) {
            console.log("No chat messages data available");
            return [];
        }

        const allMessages: any[] = [];

        chatMessagesData.pages.forEach((page, pageIndex) => {
            // Check if page has the expected structure
            if (!page?.data?.data?.lstMessages) {
                console.log(`Page ${pageIndex} has invalid structure:`, page);
                return;
            }

            const { lstMessages } = page.data.data;

            lstMessages.forEach((message: ChatMessage, messageIndex) => {
                // Handle sender image - use full URL if it starts with http, otherwise use default
                let senderAvatar = null;
                if (message.senderImage) {
                    if (message.senderImage.startsWith('http')) {
                        senderAvatar = message.senderImage;
                    } else if (message.senderImage !== '/assets/images/noimg.png') {
                        // If it's a relative path but not the default no-image path
                        senderAvatar = `https://clubyakkastorage.blob.core.windows.net${message.senderImage}`;
                    }
                }




                // Parse sent date with fallback
                let messageDate = new Date();
                if (message.sentAt) {

                    try {
                        // First try parsing the date as-is (works for most browsers)
                        let parsedDate = new Date(message.sentAt);

                        // If that doesn't work, try manual parsing
                        if (isNaN(parsedDate.getTime())) {
                            // Split date and time parts
                            const [datePart, timePart, period] = message.sentAt.split(' ');
                            const [month, day, year] = datePart.split('/');
                            const [hours, minutes, seconds] = timePart.split(':');

                            // Convert to 24-hour format
                            let hour24 = parseInt(hours, 10);
                            if (period === 'PM' && hour24 !== 12) {
                                hour24 += 12;
                            } else if (period === 'AM' && hour24 === 12) {
                                hour24 = 0;
                            }

                            // Create date object
                            parsedDate = new Date(
                                parseInt(year, 10),
                                parseInt(month, 10) - 1,
                                parseInt(day, 10),
                                hour24,
                                parseInt(minutes, 10),
                                parseInt(seconds, 10)
                            );
                        }

                        if (!isNaN(parsedDate.getTime())) {
                            messageDate = parsedDate;
                        } else {
                            console.log(`Failed to parse date for message ${message.messageId}:`, message.sentAt);
                        }
                    } catch (error) {
                        console.log(`Date parsing error for message ${message.messageId}:`, error, message.sentAt);
                    }

                }



                // Transform to GiftedChat format
                const transformedMessage = {
                    _id: message.messageId.toString(),
                    text: message.message.trim(),
                    createdAt: new Date(message?.sentAt + "Z"),
                    image: message?.image,
                    user: {
                        _id: message.senderId,
                        name: message.senderName || 'Unknown User',
                        avatar: senderAvatar,
                    },
                    metadata: {
                        threadId: message.threadId,
                        userTypeId: message.userTypeId,
                        userType: message.userType,
                        originalSentAt: new Date(message?.sentAt + "Z"),
                        messageId: message.messageId, // Keep original messageId for sorting
                        hasImage: !!message?.image,
                        image: message.image || null,
                    }
                };

                allMessages.push(transformedMessage);
            });
        });

        console.log(`Transformed ${allMessages.length} messages`);

        // Sort messages by messageId (index) first (largest first), then by timestamp (newest first)
        // This ensures messages with the largest index appear at the top
        const sortedMessages = allMessages.sort((a, b) => {
            const messageIdA = a.metadata.messageId;
            const messageIdB = b.metadata.messageId;

            // First sort by messageId (largest first - most recent index)
            if (messageIdA !== messageIdB) {
                return messageIdB - messageIdA;
            }

            // If messageIds are the same (unlikely), sort by timestamp (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        console.log('Sorted messages by largest index first:', {
            totalMessages: sortedMessages.length,
            firstMessageId: sortedMessages[0]?.metadata?.messageId,
            lastMessageId: sortedMessages[sortedMessages.length - 1]?.metadata?.messageId
        });

        // Apply additional conditions if needed
        const filteredMessages = sortedMessages.filter((message) => {
            // Filter by current thread ID
            if (itemDetails?.threadId && message.metadata.threadId !== itemDetails.threadId) {
                return false;
            }

            // Don't filter out messages that have images, even if text is empty
            if (message.image || message.metadata.hasImage) {
                return true;
            }

            // Filter out empty messages (only if they don't have images)
            if (!message.text || message.text.trim().length === 0) {
                return false;
            }

            // Add any other conditions here
            return true;
        });

        console.log(`Filtered to ${filteredMessages.length} messages for current thread`);
        console.log('Final message order (first 5):', filteredMessages.slice(0, 5).map(m => ({
            id: m.metadata.messageId,
            text: m.text.substring(0, 30) + '...',
            createdAt: m.createdAt
        })));

        return filteredMessages;
    }, [chatMessagesData, itemDetails?.threadId]);

    // Update local messages when API data changes
    useEffect(() => {
        setIsMuted(isMute);
        if (transformedMessages.length > 0) {
            setMessages(transformedMessages);
        }
    }, [transformedMessages]);

    // Keyboard event listeners - simple state management
    useEffect(() => {
        if (!isFocused) {
            keyboardDidShowListenerRef.current?.remove();
            keyboardDidHideListenerRef.current?.remove();
            return;
        }

        keyboardDidShowListenerRef.current = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => setIsKeyboardOpen(true)
        );

        keyboardDidHideListenerRef.current = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setIsKeyboardOpen(false)
        );

        return () => {
            keyboardDidShowListenerRef.current?.remove();
            keyboardDidHideListenerRef.current?.remove();
        };
    }, [isFocused]);



    // Handle loading more messages (pagination)
    const handleLoadEarlier = useCallback(() => {
        console.log("🔄 handleLoadEarlier called");
        console.log("📊 Pagination state:", {
            hasNextPage,
            isFetchingNextPage,
            pagesLoaded: chatMessagesData?.pages?.length || 0
        });

        if (hasNextPage && !isFetchingNextPage) {
            console.log("✅ Fetching next page...");
            fetchNextPage()
                .then(() => {
                    console.log("✅ Successfully fetched next page");
                })
                .catch((error) => {
                    console.error("❌ Error fetching next page:", error);
                    Alert.alert("Error", "Failed to load earlier messages. Please try again.");
                });
        } else {
            console.log("⚠️ Cannot fetch:", {
                hasNextPage,
                isFetchingNextPage,
                reason: !hasNextPage ? "No more pages" : "Already fetching"
            });

            if (!hasNextPage) {
                Alert.alert("Info", "No more messages to load");
            }
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        // Configure automatic reconnect with exponential backoff delays
        // First reconnect attempts immediately, then progressively increases
        const reconnectDelays = [0, 2000, 5000, 10000, 15000, 30000]; // 0s, 2s, 5s, 10s, 15s, 30s

        const newConnection = new SignalR.HubConnectionBuilder()
            .withUrl(CHAT_HUB_URL)
            .withAutomaticReconnect(reconnectDelays)
            .configureLogging(SignalR.LogLevel.Information)
            .build();

        // Store in ref
        connectionRef.current = newConnection;

        // Set up connection event handlers
        newConnection.onclose((error) => {
            console.log("Connection closed:", error);
            isConnectedRef.current = false;
            isConnectingRef.current = false;
        });

        newConnection.onreconnecting((error) => {
            console.log("Connection reconnecting:", error);
            isConnectedRef.current = false;
            isConnectingRef.current = true;
            reconnectAttemptRef.current += 1;
            console.log(`Reconnection attempt #${reconnectAttemptRef.current}`);
        });

        newConnection.onreconnected((connectionId) => {
            console.log("Connection reconnected:", connectionId);
            isConnectedRef.current = true;
            isConnectingRef.current = false;
            reconnectAttemptRef.current = 0; // Reset counter on successful reconnect
            joinThread(connectionId);
        });
        // Cleanup function
        return () => {
            if (connectionRef.current?.state === SignalR.HubConnectionState.Connected) {
                connectionRef.current.stop();
            }
            connectionRef.current = null;
        };
    }, []);

    // Start connection when component mounts
    useEffect(() => {
        if (connectionRef.current && !isConnectedRef.current && !isConnectingRef.current) {
            startConnection();
        }
    }, []); // Empty dependency array - only run once on mount

    const startConnection = async () => {
        if (!connectionRef.current || isConnectingRef.current) return;

        isConnectingRef.current = true;

        try {
            await connectionRef.current.start();
            console.log("✅ Connected:", connectionRef.current?.connectionId);
            isConnectedRef.current = true;
            isConnectingRef.current = false;
            setupListeners();

            await joinThread(connectionRef.current?.connectionId);
        } catch (err) {
            console.error("❌ Connection failed:", err);
            isConnectedRef.current = false;
            isConnectingRef.current = false;
            // Retry after 5 seconds with exponential backoff
            setTimeout(startConnection, 5000);
        }
    };

    const setupListeners = () => {
        // if (!connectionRef.current) return;
        connectionRef.current.on("ReceiveMessage", (message) => {

            console.log("ReceiveMessage received:", message);
            // Handle sender image - use full URL if it starts with http, otherwise use default
            let senderAvatar = undefined;
            if (message?.senderImage) {
                if (message.senderImage.startsWith('http')) {
                    senderAvatar = message.senderImage;
                } else if (message.senderImage !== '/assets/images/noimg.png') {
                    // If it's a relative path but not the default no-image path
                    senderAvatar = `https://clubyakkastorage.blob.core.windows.net${message.senderImage}`;
                }
            }

            const newMessage = {
                _id: message.messageId?.toString() || Math.random().toString(),
                text: message?.message || '',
                createdAt: new Date(message?.sentAt + "Z"),
                user: {
                    _id: message?.senderId || 0,
                    name: message?.senderName || 'Unknown User',
                    avatar: senderAvatar,
                },
                image: message?.image || undefined,
            };

            setMessages(previousMessages => {
                // If there's a matching pending message (same sender, text, and image presence),
                // replace it with the confirmed one to avoid brief duplication.
                const matchIndex = previousMessages.findIndex(m =>
                    m?.pending === true &&
                    (m?.user?._id === memberId) &&
                    ((m?.text || '') === (newMessage.text || '')) &&
                    (Boolean(m?.image) === Boolean(newMessage.image))
                );

                if (matchIndex !== -1) {
                    const updated = [...previousMessages];
                    updated[matchIndex] = newMessage;
                    return updated;
                }

                // Also guard against duplicates by id
                if (previousMessages.some(m => String(m?._id) === String(newMessage._id))) {
                    return previousMessages;
                }

                return GiftedChat.append(previousMessages, [newMessage]);
            });
        });




        connectionRef.current.on("MessageDelete", (threadId, messageId) => {
            console.log("MessageDelete received:", { threadId, messageId });

            // Remove the deleted message from local state
            setMessages(previousMessages => {
                const filteredMessages = previousMessages.filter(msg => {
                    // Convert both IDs to the same type for comparison
                    return Number(msg._id) !== Number(messageId);
                });

                console.log(`Deleted message ${messageId} from local state. Remaining: ${filteredMessages.length} messages`);
                return filteredMessages;
            });
        });


        connectionRef.current.on("ReportMessage", (perThreadId, messageId, isReported) => {
            console.log("ReportMessage received:", { perThreadId, messageId, isReported });

            console.log("ReportMessage received:", { perThreadId, messageId, isReported });
            if (perThreadId == itemDetails?.threadId) {
                if (isReported === true) {
                    ToastManager.success("Message has been reported successfully");
                } else {
                    ToastManager.error("Unable to report this message. Please try again.");
                }
            }
        });
    };

    const joinThread = async (connectionId: string | undefined) => {
        if (!connectionRef.current || !connectionId || !itemDetails?.threadId || !memberId) {
            console.log("Cannot join thread - missing required data");
            return;
        }

        const data = {
            threadId: itemDetails.threadId,
            memberId: memberId,
            type: 7,
            connectionId: connectionId
        };

        console.log("Joining thread with data:", data);

        try {
            await connectionRef.current.invoke("JoinThread", itemDetails.threadId, memberId, 7, connectionId);
            console.log(`Successfully joined thread ${itemDetails.threadId}`);
        } catch (err) {
            console.error("JoinThread error:", err);
        }
    };

    // Image upload hook
    const {
        uploadState,
        uploadImage,
    } = useImageUpload({
        containerName: 'chat',
        maxRetries: 3,
        retryDelay: 1000,
        onUploadStart: () => {
            console.log('Upload started');
        },
        onUploadProgress: (progress) => {
            console.log(`Upload progress: ${progress}%`);
        },
        onUploadSuccess: (url) => {
            console.log('Upload successful:', url);
            // ToastManager.success('Success', 'Image uploaded successfully');
        },
        onUploadError: (error) => {
            console.error('Upload error:', error);
            ToastManager.error('Upload Failed', error);
        },
        onUploadComplete: () => {
            console.log('Upload completed');
        },
    });


    const deleteMessage = async (messageId: any) => {
        console.log("Deleting message with ID:", typeof itemDetails?.threadId, typeof messageId, typeof memberId, typeof 7);
        // return
        Alert.alert("Delete Chat", "Do you really want to delete this chat?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes",
                onPress: () => {
                    connectionRef.current?.invoke("DeleteMessage", itemDetails?.threadId, Number(messageId), Number(memberId), 7)
                        .then((res) => {
                            console.log("Message deleted successfully:", res);
                        })
                        .catch((err) => {
                            console.error("DeleteMessage error:", err);
                        });
                },
            },
        ]);
    };

    const onSend = useCallback(async (messages = [], shouldSendImage = false) => {
        // Check if there's either text or an image to send
        const messageText = messages[0]?.text?.trim() || '';
        const hasText = messageText.length > 0;
        const hasImage = selectedImage !== null;

        if (!hasText && !hasImage) {
            Alert.alert("Error", "Please enter a message or select an image");
            return;
        }

        // Check if connection is ready
        if (!connectionRef.current || !isConnectedRef.current || connectionRef.current.state !== SignalR.HubConnectionState.Connected) {
            Alert.alert("Connection Error", "Chat connection is not ready. Please wait and try again.");
            console.log("Connection state:", connectionRef.current?.state, "IsConnected:", isConnectedRef.current);
            return;
        }

        // Check required data
        if (!itemDetails?.threadId || !memberId) {
            Alert.alert("Error", "Missing chat information");
            return;
        }

        // Create pending message ID
        const pendingMessageId = `pending-${Date.now()}-${Math.random()}`;

        // Save selected image reference before clearing
        const imageToUpload = selectedImage;

        try {
            let imageFileName = null;

            // Add message to state immediately with pending flag
            const pendingMessage = {
                _id: pendingMessageId,
                text: messageText,
                createdAt: new Date(),
                pending: true,
                image: hasImage ? imageToUpload?.uri : null,
                user: {
                    _id: memberId,
                },
                metadata: {
                    threadId: itemDetails?.threadId,
                }
            };

            // Add pending message to UI
            setMessages(previousMessages => [pendingMessage, ...previousMessages]);

            // Clear the input and selected image immediately
            handleRemoveImage();

            // If there's an image to send, upload it first
            if (hasImage && imageToUpload) {
                setIsUploadingImage(true);
                try {
                    const uploadResult = await uploadImage(imageToUpload);
                    if (uploadResult.success) {
                        imageFileName = imageToUpload?.fileName;
                        console.log('Image uploaded successfully:', imageFileName);
                    } else {
                        console.error('Image upload failed:', uploadResult.error);
                        Alert.alert("Upload Error", "Failed to upload image. Please try again.");
                        setIsUploadingImage(false);

                        // Remove pending message on failure
                        setMessages(previousMessages =>
                            previousMessages.filter(msg => msg._id !== pendingMessageId)
                        );
                        return;
                    }
                } catch (error) {
                    console.error('Image upload error:', error);
                    Alert.alert("Upload Error", "Failed to upload image. Please try again.");
                    setIsUploadingImage(false);

                    // Remove pending message on failure
                    setMessages(previousMessages =>
                        previousMessages.filter(msg => msg._id !== pendingMessageId)
                    );
                    return;
                } finally {
                    setIsUploadingImage(false);
                }
            }

            // Send the message with text and/or image
            await connectionRef.current.invoke("SendMessage", itemDetails?.threadId, memberId, messageText, imageFileName, 7)
                .then((res) => {
                    console.log("Message sent successfully:", res);
                })
                .catch((err) => {
                    console.error("SendMessage error:", err);
                    Alert.alert("Send Error", "Failed to send message. Please try again.");

                    // Remove pending message on failure
                    setMessages(previousMessages =>
                        previousMessages.filter(msg => msg._id !== pendingMessageId)
                    );
                });
        } catch (err) {
            console.error("SendMessage error:", err);
            Alert.alert("Send Error", "Failed to send message. Please try again.");

            // Remove pending message on failure
            setMessages(previousMessages =>
                previousMessages.filter(msg => msg._id !== pendingMessageId)
            );
        }
    }, [itemDetails?.threadId, memberId, selectedImage, uploadImage]);

    const handleGalleryPress = async () => {
        Alert.alert(
            "Select Image",
            "Choose an option to add an image",
            [
                {
                    text: "Camera",
                    onPress: () => handleImageSelection('camera'),
                },
                {
                    text: "Gallery",
                    onPress: () => handleImageSelection('gallery'),
                },
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ],
            { cancelable: true }
        );
    };

    const handleImageSelection = async (source: 'camera' | 'gallery') => {
        const options = {};
        try {
            const result = await pickImage({ ...options, source });

            if (result) {
                // Store the image in state instead of immediately sending
                setSelectedImage(result);
            }
        } catch (error) {
            console.error(`${source} error:`, error);
            Alert.alert('Error', `Failed to select image from ${source}. Please try again.`);
        }
    };

    const openImageViewer = useCallback((uri: string) => {
        setImageViewerUri(uri);
        setIsImageViewerVisible(true);
    }, []);

    const closeImageViewer = useCallback(() => {
        setIsImageViewerVisible(false);
        setImageViewerUri(null);
    }, []);

    const handleRemoveImage = useCallback(() => {
        setSelectedImage(null);
    }, []);


    // Report modal functions
    const openReportModal = useCallback((message: any) => {
        Keyboard.dismiss();
        setSelectedMessage(message);
        setShowReportModal(true);
    }, []);

    const closeReportModal = useCallback(() => {
        setShowReportModal(false);
        setReportReason('');
        setSelectedMessage(null);
        setReportError('');
    }, []);

    const handleReportSubmit = async () => {
        console.log("handleReportSubmit", itemDetails?.threadId, memberId, selectedMessage?._id, selectedMessage?.user?._id, selectedMessage?.user?.userTypeId, 'Report');

        // Clear any previous error
        setReportError('');

        if (!reportReason.trim()) {
            setReportError("Please provide a reason for reporting this message.");
            return;
        }


        await connectionRef.current.invoke("MessageReport", Number(itemDetails?.threadId), Number(selectedMessage?._id), Number(memberId), 7, String(reportReason))
            .then((res) => {
                console.log("Message reported successfully:", res);
                closeReportModal();
                ToastManager.success("Message has been reported successfully");
            })
            .catch((err) => {
                console.error("MessageReport error:", err);
                ToastManager.error("Unable to report this message. Please try again.");
            });
    };

    // Memoized bubble renderer for better performance
    const renderBubble = useCallback((props: any) => {
        const isCurrentUser = props.currentMessage.user._id === memberId;

        return (

            <View style={styles.messageContainer}>
                {/* Show avatar and name for other users (left side) */}
                {!isCurrentUser && (
                    <View style={styles.leftMessageWrapper}>
                        <View style={styles.avatarContainer}>
                            {props.currentMessage.user.avatar ? (
                                <Image
                                    source={{ uri: props?.currentMessage?.user?.avatar }}
                                    style={styles.avatar}
                                    onError={(error) => {
                                        console.log("Avatar loading error:", error.nativeEvent.error);
                                    }}
                                />
                            ) : (
                                <View style={styles.defaultAvatar}>
                                    <Text style={styles.avatarInitial}>
                                        {props.currentMessage.user.name?.charAt(0) || 'U'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.messageContentLeft}>
                            {props.currentMessage.user.name && (
                                <Text style={styles.userName}>
                                    {props.currentMessage.user.name}
                                </Text>
                            )}
                            <Bubble
                                {...props}
                                wrapperStyle={{
                                    left: {
                                        backgroundColor: theme.colors.blue,
                                        borderRadius: 16,
                                        padding: 8,
                                        marginBottom: 2,
                                        marginLeft: 0,
                                        maxWidth: "80%",
                                        borderWidth: 1,
                                        borderColor: "#E5E5E5",
                                    },
                                }}
                                textStyle={{
                                    left: { color: theme.colors.white, fontSize: 15 },
                                }}
                                timeTextStyle={{
                                    left: { color: theme.colors.white, fontSize: 12, alignSelf: "flex-start" },
                                }}
                                onLongPress={() => {
                                    Keyboard.dismiss();
                                    openReportModal(props.currentMessage);
                                }}
                                renderMessageImage={(imageProps) => {

                                    if (imageProps.currentMessage.pending) {
                                        return (
                                            <View style={styles.pendingImageContainer}>
                                                <ActivityIndicator size="small" color={theme.colors.blue} />
                                                <Text style={styles.pendingText}>
                                                    {imageProps.currentMessage.text}
                                                </Text>
                                            </View>
                                        );
                                    }

                                    return (
                                        <TouchableOpacity
                                            onLongPress={() => {
                                                Keyboard.dismiss();
                                                openReportModal(imageProps.currentMessage);
                                            }}
                                            onPress={() => {
                                                if (imageProps.currentMessage?.image) {
                                                    openImageViewer(imageProps.currentMessage.image);
                                                }
                                            }}>
                                            <View style={styles.messageImageContainer}>
                                                <Image
                                                    source={{ uri: imageProps.currentMessage.image }}
                                                    style={styles.messageImage}
                                                    resizeMode="cover"
                                                    onError={(error) =>
                                                        console.log("Image loading error:", error.nativeEvent.error)
                                                    }
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    </View>
                )}

                {/* Show messages for current user (right side) - NO AVATAR */}
                {isCurrentUser && (
                    <View style={styles.rightMessageWrapper}>
                        <Bubble
                            {...props}
                            wrapperStyle={{
                                right: {
                                    backgroundColor: theme.colors.lightLavenderGray,
                                    borderRadius: 16,
                                    padding: 8,
                                    marginBottom: 2,
                                    marginRight: moderateScale(15),
                                    maxWidth: "70%",
                                },
                            }}
                            textStyle={{
                                right: {
                                    color: theme.colors.black,
                                    fontSize: 15,
                                },
                            }}
                            timeTextStyle={{
                                right: { color: theme.colors.black, fontSize: 12, alignSelf: "flex-end" },
                            }}
                            onLongPress={() => {
                                Keyboard.dismiss();
                                // alert('Long press detected');
                                deleteMessage(props.currentMessage._id);
                            }}
                            renderMessageImage={(imageProps) => {
                                if (imageProps.currentMessage.pending) {
                                    return (
                                        <View style={styles.pendingImageContainer}>
                                            <ActivityIndicator size="small" color={theme.colors.blue} />
                                            <Text style={styles.pendingText}>Uploading...</Text>
                                        </View>
                                    );
                                }

                                return (
                                    <TouchableOpacity
                                        onLongPress={() => {
                                            Keyboard.dismiss();
                                            // alert('Long press detected on image');
                                            deleteMessage(imageProps.currentMessage._id);
                                        }}
                                        onPress={() => {
                                            if (imageProps.currentMessage?.image) {
                                                openImageViewer(imageProps.currentMessage.image);
                                            }
                                        }}>
                                        <View style={styles.messageImageContainerRight}>
                                            <Image
                                                source={{ uri: imageProps.currentMessage.image }}
                                                style={styles.messageImage}
                                                resizeMode="cover"
                                                onError={(error) =>
                                                    console.log("Image loading error:", error.nativeEvent.error)
                                                }
                                            />
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                )}
            </View>
        );
    }, [memberId, openImageViewer, openReportModal, deleteMessage]);


    // Memoized input toolbar with optimized conditional rendering
    const renderInputToolbar = useCallback((props: any) => {
        // Compute margin bottom based on keyboard state
        const inputMarginBottom = Platform.OS === 'android' ? isKeyboardOpen ? moderateScale(-5) : moderateScale(10) : isKeyboardOpen ? moderateScale(-20) : moderateScale(10);

        return (
            <View style={[styles.newInputToolbarWrapper, { marginBottom: inputMarginBottom }]}>
                {/* Green Plus Icon */}
                <TouchableOpacity
                    style={styles.addCommentButton}
                    onPress={handleGalleryPress}
                    activeOpacity={0.7}
                >
                    <SVG.addCircle width={moderateScale(30)} height={moderateScale(30)} />
                </TouchableOpacity>

                {/* Input Field */}
                <View style={styles.inputFieldContainer}>
                    {/* Image Preview - conditional rendering */}
                    {selectedImage ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image
                                source={{ uri: selectedImage.uri }}
                                style={styles.imagePreview}
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={handleRemoveImage}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.removeImageText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    <InputToolbar
                        {...props}
                        containerStyle={styles.newInputToolbar}
                        renderComposer={(composerProps) => (
                            <Composer
                                {...composerProps}
                                textInputStyle={styles.newTextInput}
                                placeholder="Add Comment"
                                placeholderTextColor="#999"
                            />
                        )}
                        renderActions={() => null}
                    />
                </View>

                {/* Send Button */}
                <TouchableOpacity
                    style={styles.newSendButton}
                    onPress={() => {
                        const messageText = props.text?.trim() || '';
                        const hasText = messageText.length > 0;
                        const hasImage = selectedImage !== null;

                        if (hasText || hasImage) {
                            const messageToSend = [{
                                _id: Math.random().toString(),
                                text: messageText,
                                createdAt: new Date(),
                                user: { _id: memberId }
                            }];
                            props.onSend(messageToSend, true);
                        }
                    }}
                    activeOpacity={0.7}
                    disabled={isUploadingImage}
                >
                    {isUploadingImage ? (
                        <ActivityIndicator size="small" color={theme.colors.blue} />
                    ) : (
                        <SVG.chatSend
                            width={moderateScale(30)}
                            height={moderateScale(30)}
                        />
                    )}
                </TouchableOpacity>
            </View>
        );
    }, [isKeyboardOpen, selectedImage, isUploadingImage, memberId, handleGalleryPress, handleRemoveImage]);


    return (
        console.log("teamteam", team),

        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <StatusBar backgroundColor={theme.colors.blue} barStyle="light-content" />
                {Platform.OS === "android" && <View style={styles.statusBarBackground} />}

                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity onPress={() => {
                            refetchMessages();
                            navigation.goBack();
                        }}>
                            <SVG.arrowLeft_white
                                width={moderateScale(25)}
                                height={moderateScale(25)}
                            />
                        </TouchableOpacity>
                        <View style={{ flexDirection: "row", flex: 1 }}>
                            <View style={styles.userConSty}>
                                {!!team?.teamProfileImage || team?.clubImage ? (
                                    <Image
                                        source={{ uri: team?.teamProfileImage || team?.clubImage }}
                                        style={styles.userDetailsSty}
                                    />
                                ) : (
                                    <View style={styles.placeholderLogoHeader}>
                                        <SVG.UsersIcon
                                            width={moderateScale(20)}
                                            height={moderateScale(20)}
                                        />
                                    </View>
                                )}
                            </View>
                            <View style={styles.clubInfoContainer}>
                                <Text style={styles.userNameSty}>
                                    {team?.teamName || team?.clubName || "Unknown Member"}
                                </Text>
                                <Text style={styles.totalMembersSty}>
                                    {team?.totalMembers || 0}{" "}
                                    {(team?.totalMembers || 0) === 1 ? "member" : "members"}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={{ alignSelf: 'center' }}
                            onPress={() => setShowMoreModal(true)}
                            activeOpacity={0.7}
                        >
                            <SVG.more width={moderateScale(18)} height={moderateScale(18)} />
                        </TouchableOpacity>
                    </View>

                </View>
                <View style={styles.contentList}>
                    <Text style={styles.trainingDayText} numberOfLines={1} ellipsizeMode="tail">
                        {itemDetails?.threadName ? itemDetails?.threadName : `${itemDetails?.slotStartTime}-${itemDetails?.slotEndTime}`}
                    </Text>
                    <View style={styles.contentListWhite}>
                        <GiftedChat
                            messages={messages}
                            onSend={messages => onSend(messages)}
                            user={{
                                _id: memberId,
                            }}
                            renderBubble={renderBubble}
                            alwaysShowSend={true}
                            renderInputToolbar={renderInputToolbar}
                            renderSend={() => <></>}
                            showAvatarForEveryMessage={true}
                            inverted={true}
                            renderUsernameOnMessage={false}
                            maxInputLength={400}
                            minComposerHeight={50}
                            renderAvatar={() => <></>}
                            loadEarlier={hasNextPage}
                            onLoadEarlier={handleLoadEarlier}
                            isLoadingEarlier={isFetchingNextPage}
                            infiniteScroll={true}
                            keyboardShouldPersistTaps="handled"
                        />
                    </View>
                </View>

                {/* Report Modal */}
                <Modal
                    visible={showReportModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={closeReportModal}
                >
                    <KeyboardAwareScrollView
                        enableOnAndroid={true}
                        enableAutomaticScroll={true}
                        extraScrollHeight={Platform.OS === 'ios' ? 120 : 0}
                        contentContainerStyle={styles.modalContainer}
                        keyboardShouldPersistTaps="handled"
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={closeReportModal}
                        >
                            <View
                                style={styles.modalContent}
                                onStartShouldSetResponder={() => true}
                            >
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Report Message</Text>
                                    <TouchableOpacity onPress={closeReportModal}>
                                        <Text style={styles.closeButton}>✕</Text>
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    style={styles.modalBody}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={styles.modalBodyContent}
                                    nestedScrollEnabled={true}
                                >
                                    <Text style={styles.modalSubtitle}>
                                        Why are you reporting this message?
                                    </Text>

                                    <TextInput
                                        style={[
                                            styles.reportInput,
                                            reportError ? styles.reportInputError : null
                                        ]}
                                        placeholder="Please describe the issue..."
                                        placeholderTextColor="#999"
                                        multiline
                                        numberOfLines={6}
                                        maxLength={400}
                                        value={reportReason}
                                        onChangeText={(text) => {
                                            setReportReason(text);
                                            if (reportError) setReportError('');
                                        }}
                                        textAlignVertical="top"
                                    />
                                    <View style={styles.inputBottomContainer}>
                                        {reportError ? (
                                            <Text style={styles.errorText}>{reportError}</Text>
                                        ) : null}
                                        <Text style={[
                                            styles.characterCount,
                                            reportReason.length >= 400 ? styles.characterCountWarning : null
                                        ]}>
                                            {reportReason.length}/400
                                        </Text>
                                    </View>
                                </ScrollView>

                                <View style={styles.modalFooter}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={closeReportModal}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.submitButton}
                                        onPress={handleReportSubmit}
                                    >
                                        <Text style={styles.submitButtonText}>Submit Report</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </KeyboardAwareScrollView>
                </Modal>

                {/* Image Viewer Modal */}
                <Modal
                    visible={isImageViewerVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={closeImageViewer}
                >
                    <GestureHandlerRootView style={styles.viewerContainer}>
                        <TouchableOpacity style={styles.viewerBackdrop} activeOpacity={1} onPress={closeImageViewer} />
                        <View style={styles.viewerContent}>
                            {imageViewerUri ? (
                                <ImageZoom
                                    uri={imageViewerUri}
                                    minScale={1}
                                    maxScale={5}
                                    doubleTapScale={3}
                                    isSingleTapEnabled={true}
                                    isDoubleTapEnabled={true}
                                    onSingleTap={closeImageViewer}
                                    style={styles.viewerImage}
                                />
                            ) : null}
                        </View>
                        <TouchableOpacity onPress={closeImageViewer} style={styles.viewerClose}>
                            <Text style={styles.viewerCloseText}>✕</Text>
                        </TouchableOpacity>
                    </GestureHandlerRootView>
                </Modal>


                <Modal
                    visible={showMoreModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowMoreModal(false)}
                >
                    <View style={styles.bottomSheetOverlay}>
                        <TouchableOpacity style={styles.bottomSheetOverlayTouchable} activeOpacity={1} onPress={() => setShowMoreModal(false)} />
                        <View style={styles.bottomSheetContent}>
                            <View style={styles.bottomSheetHandle} />
                            <TouchableOpacity
                                style={styles.bottomSheetOption}
                                onPress={async () => {
                                    try {
                                        const response = await mainService.updateChatMuteStatus({
                                            chatTypeId: userType == "volunteer" ? 2 : 1,
                                            teamId: teamId,
                                            memberId: memberId,
                                            threadId: itemDetails?.threadId,
                                            isMute: !isMuted
                                        });
                                        setIsMuted(prev => !prev);
                                        ToastManager.success(
                                            !isMuted ? 'Muted successfully' : 'Unmuted successfully'
                                        );
                                    } catch (err) {
                                        console.error('Mute/Unmute error:', err);
                                        ToastManager.error('Failed to update mute status');
                                    } finally {
                                        setShowMoreModal(false);
                                    }
                                }}
                            >
                                <Text style={styles.bottomSheetOptionText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.bottomSheetOption, styles.bottomSheetCancel]}
                                onPress={() => setShowMoreModal(false)}
                            >
                                <Text style={styles.bottomSheetCancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.blue,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    statusBarBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: Platform.OS === "ios" ? 44 : 0,
        backgroundColor: theme.colors.blue,
        zIndex: 1000,
    },
    header: {
        backgroundColor: theme.colors.blue,
        paddingTop: Platform.OS === "android" ? theme.spacing.lg : theme.spacing.xs,
        paddingBottom: Platform.OS === "android" ? -theme.spacing.md : moderateScale(0),
    },
    headerTopRow: {
        flexDirection: "row",
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.sm,
    },
    clubInfoContainer: {
        marginLeft: moderateScale(4),
        justifyContent: 'center',
    },
    userNameSty: {
        color: theme.colors.white,
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(16),
    },
    totalMembersSty: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(11),
        color: theme.colors.appleGreen,
    },
    userDetailsSty: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
    },
    userConSty: {
        marginLeft: moderateScale(12),
        marginRight: theme.spacing.xs,
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(20),
        borderWidth: 1.5,
        borderColor: theme.colors.imageBorder,
        backgroundColor: theme.colors.imageBorder,
        alignItems: "center",
        justifyContent: "center",
    },
    placeholderLogoHeader: {
        width: moderateScale(20),
        height: moderateScale(20),
        borderRadius: moderateScale(10),
        alignItems: "center",
        justifyContent: "center",
    },
    trainingDayContainer: {
        alignItems: 'center',
        paddingHorizontal: moderateScale(16),
    },
    trainingDayText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(16),
        color: theme.colors.blue,
        textAlign: 'center',
        marginTop: moderateScale(8),
        paddingHorizontal: moderateScale(16),
    },
    contentList: {
        flex: 1,
        backgroundColor: theme.colors.lightLavenderGray,
        borderTopLeftRadius: moderateScale(30),
        borderTopRightRadius: moderateScale(30),
    },
    contentListWhite: {
        flex: 1,
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: moderateScale(30),
        borderTopRightRadius: moderateScale(30),
        marginTop: theme.spacing.sm,
    },
    inputToolbar: {
        borderTopWidth: 0,
        backgroundColor: 'transparent',
        paddingHorizontal: moderateScale(16),
        paddingVertical: moderateScale(8),
    },

    textInput: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.black,
        flex: 1,
        paddingHorizontal: moderateScale(12),
        paddingVertical: moderateScale(8),
        minHeight: moderateScale(40),
    },
    sendButton: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
        backgroundColor: theme.colors.blue,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: moderateScale(8),
    },
    scrollToBottomStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        height: moderateScale(30),
        width: moderateScale(30),
        borderRadius: moderateScale(15),
        backgroundColor: theme.colors.blue,
        margin: moderateScale(10),
    },
    threadsContainer: {
        backgroundColor: theme.colors.lightLavenderGray,
        top: moderateScale(-25),
        paddingVertical: moderateScale(4),
        borderTopLeftRadius: moderateScale(30),
        borderTopRightRadius: moderateScale(30),
        paddingHorizontal: moderateScale(16),
        marginBottom: moderateScale(8)
    },
    messageContainer: {
        flexDirection: 'row',
        marginVertical: moderateScale(4),
    },
    leftMessageWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    rightMessageWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        flex: 1,
    },
    avatarContainer: {
        marginRight: moderateScale(8),
    },
    avatar: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
    },
    defaultAvatar: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
        backgroundColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: moderateScale(16),
        color: theme.colors.black,
    },
    messageContentLeft: {
        maxWidth: '90%',
    },
    userName: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(12),
        color: theme.colors.black,
        marginBottom: moderateScale(4),
    },
    pendingImageContainer: {
        width: 200,
        height: 200,
        borderRadius: 8,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    pendingText: {
        marginTop: 8,
        color: "#666",
        fontSize: 14,
    },
    messageImageContainer: {
        maxWidth: moderateScale(220),
        maxHeight: moderateScale(220),
        borderRadius: 8,
        overflow: 'hidden',
    },
    messageImageContainerRight: {
        alignSelf: 'flex-end',
        maxWidth: moderateScale(220),
        maxHeight: moderateScale(220),
        borderRadius: 8,
        overflow: 'hidden',
    },
    messageImage: {
        width: '100%',
        aspectRatio: 1,
    },

    inputToolbarContainer: {
        backgroundColor: theme.colors.white,
    },
    inputToolbarWrapper: {
        backgroundColor: theme.colors.white,
        marginHorizontal: moderateScale(16),
        borderRadius: moderateScale(25),
        marginVertical: moderateScale(8),
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: Platform.OS === "ios" ? moderateScale(20) : moderateScale(2),
    },
    attachButton: {
        marginLeft: moderateScale(1),
    },
    newInputToolbarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        marginHorizontal: moderateScale(16),
        borderRadius: moderateScale(30),
        marginVertical: moderateScale(8),
        borderWidth: 1,
        borderColor: theme.colors.border,
        // marginBottom will be set dynamically based on platform and navigation bar state
    },
    addCommentButton: {
        marginLeft: moderateScale(8),
    },
    plusIcon: {
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: moderateScale(12),
        backgroundColor: theme.colors.green,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusText: {
        color: theme.colors.white,
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
    inputFieldContainer: {
        flex: 1,
    },
    imagePreviewContainer: {
        marginHorizontal: moderateScale(12),
        marginTop: moderateScale(8),
        marginBottom: moderateScale(4),
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: moderateScale(150),
        borderRadius: moderateScale(8),
    },
    removeImageButton: {
        position: 'absolute',
        top: moderateScale(8),
        right: moderateScale(8),
        width: moderateScale(28),
        height: moderateScale(28),
        borderRadius: moderateScale(14),
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeImageText: {
        color: theme.colors.white,
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    newInputToolbar: {
        borderTopWidth: 0,
        backgroundColor: 'transparent',
    },
    newTextInput: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.black,
        flex: 1,
        paddingVertical: moderateScale(10),
        minHeight: moderateScale(40)
    },
    newSendButton: {
        width: moderateScale(46),
        height: moderateScale(46),
        borderRadius: moderateScale(23),
        backgroundColor: theme.colors.lightLavenderGray,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(8),
    },
    // Empty state styles
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateScale(32),
        paddingBottom: moderateScale(100), // Leave space for input toolbar
    },
    emptyStateContent: {
        alignItems: 'center',
        maxWidth: moderateScale(280),
    },
    emptyStateTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(18),
        color: theme.colors.black,
        marginTop: moderateScale(16),
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.textSecondary,
        marginTop: moderateScale(8),
        textAlign: 'center',
        lineHeight: moderateScale(20),
    },
    errorIconContainer: {
        marginBottom: moderateScale(8),
    },
    emptyIconContainer: {
        marginBottom: moderateScale(8),
    },
    retryButton: {
        marginTop: moderateScale(20),
        paddingHorizontal: moderateScale(24),
        paddingVertical: moderateScale(12),
        backgroundColor: theme.colors.blue,
        borderRadius: moderateScale(8),
    },
    retryButtonText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.white,
    },
    emptyStateInputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.white,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: moderateScale(20),
        paddingVertical: moderateScale(20),
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderRadius: moderateScale(16),
        width: '100%',
        // maxHeight: Platform.OS === 'ios' ? '85%' : '80%',
        overflow: 'hidden',
        borderWidth: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: moderateScale(16),
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(18),
        color: theme.colors.black,
    },
    closeButton: {
        fontSize: moderateScale(24),
        color: theme.colors.textSecondary,
        fontWeight: '300',
    },
    modalBody: {
        flexGrow: 1,
        maxHeight: moderateScale(250),
    },
    modalBodyContent: {
        padding: moderateScale(16),
    },
    modalSubtitle: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.textSecondary,
        marginBottom: moderateScale(12),
    },
    reportInput: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.black,
        backgroundColor: theme.colors.lightLavenderGray,
        borderRadius: moderateScale(8),
        padding: moderateScale(12),
        minHeight: moderateScale(120),
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    reportInputError: {
        borderColor: '#FF4444',
        borderWidth: 1,
    },
    errorText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: '#FF4444',
        marginTop: moderateScale(8),
        marginLeft: moderateScale(4),
    },
    inputBottomContainer: {
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    characterCount: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.textSecondary,
        alignSelf: 'flex-end',
        marginTop: moderateScale(8),
    },
    characterCountWarning: {
        color: '#FF4444',
    },
    modalFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        padding: moderateScale(16),
    },
    cancelButton: {
        flex: 1,
        paddingVertical: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(8),
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelButtonText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.black,
    },
    submitButton: {
        flex: 1,
        paddingVertical: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.blue,
        borderRadius: moderateScale(8),
        marginLeft: moderateScale(8),
    },
    submitButtonText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.white,
    },
    // Image viewer styles
    viewerContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)'
    },
    viewerBackdrop: {
        ...StyleSheet.absoluteFillObject as any,
    },
    viewerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    viewerControls: {
        position: 'absolute',
        bottom: moderateScale(40),
        flexDirection: 'row',
        gap: moderateScale(12),
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: moderateScale(12),
        paddingVertical: moderateScale(8),
        borderRadius: moderateScale(20),
    },
    viewerButton: {
        paddingHorizontal: moderateScale(12),
        paddingVertical: moderateScale(6),
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: moderateScale(16),
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: moderateScale(48),
    },
    viewerButtonText: {
        color: '#fff',
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(14),
    },
    viewerClose: {
        position: 'absolute',
        top: moderateScale(50),
        right: moderateScale(20),
        backgroundColor: 'rgba(255,255,255,0.15)',
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewerCloseText: {
        color: '#fff',
        fontSize: moderateScale(18),
    },
    bottomSheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    bottomSheetOverlayTouchable: {
        flex: 1,
    },
    bottomSheetContent: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: moderateScale(16),
        borderTopRightRadius: moderateScale(16),
        paddingBottom: Platform.OS === 'ios' ? moderateScale(24) : moderateScale(16),
        paddingTop: moderateScale(8),
        paddingHorizontal: moderateScale(16),
        borderTopWidth: 1,
        borderColor: theme.colors.border,
    },
    bottomSheetHandle: {
        alignSelf: 'center',
        width: moderateScale(40),
        height: moderateScale(4),
        borderRadius: moderateScale(2),
        backgroundColor: '#D9D9D9',
        marginBottom: moderateScale(8),
    },
    bottomSheetOption: {
        paddingVertical: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    bottomSheetOptionText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.black,
    },
    bottomSheetCancel: {
        borderBottomWidth: 0,
        marginTop: moderateScale(4),
        marginBottom: Platform.OS === 'android' ? moderateScale(15) : moderateScale(0),
    },
    bottomSheetCancelText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.textSecondary,
    },
});
