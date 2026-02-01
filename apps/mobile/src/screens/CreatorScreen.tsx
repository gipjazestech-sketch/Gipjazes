import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Dimensions,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    SafeAreaView
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import fs from 'react-native-fs';
import { videoService } from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FILTERS = [
    { name: 'Normal', cmd: '' },
    { name: 'B&W', cmd: '-vf "hue=s=0"' },
    { name: 'Vibrant', cmd: '-vf "eq=saturation=1.5"' },
    { name: 'Retro', cmd: '-vf "curves=vintage"' },
];

const CreatorScreen = ({ navigation }: any) => {
    const device = useCameraDevice('back');
    const { hasPermission, requestPermission } = useCameraPermission();
    const camera = useRef<any>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (!hasPermission) requestPermission();
    }, [hasPermission]);

    const startRecording = async () => {
        if (!camera.current) return;
        setIsRecording(true);
        try {
            await camera.current.startRecording({
                onRecordingFinished: (video: any) => {
                    setRecordedVideo(video.path);
                    setIsRecording(false);
                },
                onRecordingError: (error: any) => console.error(error),
            });
        } catch (e) {
            console.error('Failed to start recording', e);
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        if (camera.current) {
            await camera.current.stopRecording();
        }
    };

    const uploadVideo = async (filePath: string) => {
        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append('video', {
                uri: `file://${filePath}`,
                type: 'video/mp4',
                name: 'upload.mp4',
            } as any);
            formData.append('description', description);
            formData.append('title', `Video ${new Date().toLocaleTimeString()}`);

            await videoService.uploadVideo(formData);

            setRecordedVideo(null);
            setDescription('');
            navigation.navigate('Home');
        } catch (error) {
            console.error('Upload failed', error);
            Alert.alert('Upload Error', 'Video upload failed, please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const processAndUpload = async () => {
        if (!recordedVideo) return;
        setIsProcessing(true);

        const outputFilePath = `${fs.CachesDirectoryPath}/processed_${Date.now()}.mp4`;
        const command = `-i ${recordedVideo} -t 5 ${activeFilter.cmd} -c:v mpeg4 ${outputFilePath}`;

        FFmpegKit.execute(command).then(async (session: any) => {
            const returnCode = await session.getReturnCode();
            if (ReturnCode.isSuccess(returnCode)) {
                await uploadVideo(outputFilePath);
            } else {
                console.error('FFmpeg processing failed');
                setIsProcessing(false);
            }
        });
    };

    const discardVideo = () => {
        setRecordedVideo(null);
        setIsProcessing(false);
        setDescription('');
    };

    if (!device || !hasPermission) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>No Camera / No Permission</Text>
            </View>
        );
    }

    if (recordedVideo) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <Video
                    source={{ uri: recordedVideo }}
                    style={styles.fullScreen}
                    resizeMode="cover"
                    repeat
                />

                {isProcessing && (
                    <View style={styles.processingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.text}>Processing...</Text>
                    </View>
                )}

                <View style={styles.controlsOverlay}>
                    <View style={styles.descriptionContainer}>
                        <TextInput
                            style={styles.descriptionInput}
                            placeholder="Add a description #hashtags..."
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            multiline
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View style={styles.filterRow}>
                        {FILTERS.map((f) => (
                            <TouchableOpacity
                                key={f.name}
                                style={[styles.filterChip, activeFilter.name === f.name && styles.activeChip]}
                                onPress={() => setActiveFilter(f)}
                            >
                                <Text style={styles.filterText}>{f.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={discardVideo}>
                            <Icon name="trash-outline" size={24} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.primaryButton, !description.trim() && styles.disabledButton]}
                            onPress={processAndUpload}
                            disabled={!description.trim() || isProcessing}
                        >
                            <Text style={styles.buttonText}>Apply & Post</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                video={true}
                audio={true}
            />

            <TouchableOpacity
                style={styles.recordButton}
                onPress={isRecording ? stopRecording : startRecording}
            >
                <View style={[styles.innerRecordButton, isRecording && styles.recordingState]} />
            </TouchableOpacity>

            {!isRecording && (
                <View style={styles.sideButtons}>
                    <TouchableOpacity
                        style={styles.sideButton}
                        onPress={() => {
                            Alert.alert("Gallery", "Opening media gallery...");
                            setTimeout(() => {
                                Alert.alert("Coming Soon", "Gallery selection is being polished for the next update.");
                            }, 1000);
                        }}
                    >
                        <Icon name="images-outline" size={28} color="#fff" />
                        <Text style={styles.sideButtonText}>Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.sideButton, { marginTop: 20 }]}
                        onPress={async () => {
                            setIsProcessing(true);
                            try {
                                Alert.alert("AI Magic", "Analyzing trends and generating script...");
                                await new Promise(r => setTimeout(r, 2000));
                                Alert.alert("AI Magic", "Synthesizing AI video assets...");
                                await new Promise(r => setTimeout(r, 3000));
                                Alert.alert("Development Notice", "AI Generation is in sandbox mode. Final results coming soon!");
                            } finally {
                                setIsProcessing(false);
                            }
                        }}
                    >
                        <Icon name="sparkles" size={28} color="#fff" />
                        <Text style={styles.sideButtonText}>AI Magic</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    fullScreen: {
        ...StyleSheet.absoluteFillObject,
    },
    recordButton: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        borderColor: 'rgba(255,255,255,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerRecordButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fe2c55',
    },
    recordingState: {
        width: 30,
        height: 30,
        borderRadius: 4,
    },
    sideButtons: {
        position: 'absolute',
        right: 20,
        bottom: 120,
        alignItems: 'center',
    },
    sideButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 12,
        width: 70,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    sideButtonText: {
        color: '#fff',
        fontSize: 10,
        marginTop: 6,
        fontWeight: '700',
    },
    controlsOverlay: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    descriptionContainer: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
    },
    descriptionInput: {
        color: '#fff',
        fontSize: 14,
        maxHeight: 100,
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeChip: {
        borderColor: '#fe2c55',
    },
    filterText: {
        color: '#fff',
        fontSize: 12,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#fe2c55',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 15,
    },
    disabledButton: {
        backgroundColor: '#888',
    },
    secondaryButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    processingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    text: {
        color: '#fff',
        marginTop: 10,
    },
});

export default CreatorScreen;
