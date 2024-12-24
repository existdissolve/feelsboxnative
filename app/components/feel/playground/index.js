import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {PanResponder, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import {Divider, IconButton, Menu, Paragraph, Switch, Text, TextInput, useTheme} from 'react-native-paper';
import {fromHsv, TriangleColorPicker} from 'react-native-color-picker';
import {cloneDeep, get, last, pick} from 'lodash';

import {CategoryPicker, Container, Dialog, Loading, SnackbarContext, Spacer, Toolbar} from '-/components/shared';
import {
    addFeel as addFeelMutation,
    editFeel as editFeelMutation,
    getFeel,
    getFeels,
    testFeel as testFeelMutation
} from '-/graphql/feel';

const nodes = Array(64).fill(true);
const preparePixels = frame => {
    const {pixels = []} = frame;

    return pixels.reduce((map, pixel) => {
        const {color, position} = pixel;
        const num = Number(position);

        map[num] = `#${color}`;

        return map;
    }, {});
};

export default props => {    
    const theme = useTheme();
    const {navigation} = props;
    const _id = get(props, 'route.params._id');
    const [history, setHistory] = useState([[]]);
    const [currentColor, setCurrentColor] = useState(undefined);
    const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
    const [frames, setFrames] = useState([{isThumb: true, pixels: []}]);
    const [gridSpec, setGridSpec] = useState([]);
    const [isLoading, setIsLoading] = useState(!!_id);
    const [isLongPressActive, setIsLongPressActive] = useState(false);
    const [isLayerMenuVisible, setIsLayerMenuVisible] = useState(false);
    const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [layerMenuAnchor, setLayerMenuAnchor] = useState(null);
    const [testDuration, setTestDuration] = useState('');
    const [testRepeat, setTestRepeat] = useState(false);
    const [testReverse, setTestReverse] = useState(false);
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [duration, setDuration] = useState(300);
    const [repeat, setRepeat] = useState(false);
    const [reverse, setReverse] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [testFeel] = useMutation(testFeelMutation);
    const [editFeel] = useMutation(editFeelMutation);
    const [addFeel] = useMutation(addFeelMutation);
    const canvas = useRef(null);
    const {show} = useContext(SnackbarContext);
    const frameHistory = history[currentFrameIdx];
    const activePixels = preparePixels(frames[currentFrameIdx]);
    const isThumb = get(frames[currentFrameIdx], 'isThumb');
    const panResponder = useMemo(
        () => PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: e => {
                const {nativeEvent} = e;
                const {pageX, pageY: pageYAbs} = nativeEvent;
                const {viewTop, spec} = gridSpec;
                const pageY = pageYAbs - viewTop;
                const nodeIndex = spec.findIndex(node => {
                    const {bottom, left, right, top} = node;


                    return bottom >= pageY && left <= pageX && right >= pageX && top <= pageY;
                });

                onPixelPress(nodeIndex);
            }
        }), [gridSpec, history, activePixels]
    );

    const onQueryComplete = data => {
        const feel = get(data, 'feel', {});
        const {categories = [], duration, frames: rawFrames = [], name, private: isPrivate, repeat, reverse} = feel;
        const {frames, history} = rawFrames.reduce((data, frame) => {
            const {isThumb, pixels: rawPixels = []} = frame;
            const pixels = rawPixels.map(pixel => pick(pixel, ['color', 'position']));
            const colors = pixels.reduce((mapping, pixel) => {
                const {color, position} = pixel;

                mapping[position] = `#${color}`;
                
                return mapping;
            }, {});

            data.frames.push({isThumb, pixels});
            data.history.push([colors]);
            
            return data;
        }, {frames: [], history: []});

        setDuration(duration);
        setName(name);
        setIsPrivate(isPrivate);
        setRepeat(repeat);
        setReverse(reverse);
        setCategories(categories.map(category => category._id));
        setFrames(frames);
        setHistory(history);
        setIsLoading(false);
    };
    
    useQuery(getFeel, {
        notifyOnNetworkStatusChange: true,
        onCompleted: onQueryComplete,
        skip: !_id,
        variables: {_id}
    });

    const onColorChange = color => {
        setCurrentColor(fromHsv(color));
    };

    const getPixelsForFrame = pixels => {
        return Object.keys(pixels).map(key => {
            const color = pixels[key];

            return {
                position: Number(key),
                color: color ? color.replace('#', '') : '000000'
            };
        });
    };

    const updateFrameHistory = (source, index = currentFrameIdx, removeFrame) => {
        const allHistory = cloneDeep(source);
        const pixels = cloneDeep(last(allHistory[index]) || []);
        const allFrames = cloneDeep(frames);
        
        if (!allFrames[index]) {
            allFrames.push({isThumb: false});
        } else if (removeFrame) {
            allFrames.splice(currentFrameIdx, 1);
        }

        if (!removeFrame) {
            allFrames[index].pixels = getPixelsForFrame(pixels);
        }

        setFrames(allFrames);
        setHistory(allHistory);

        if (index !== currentFrameIdx) {
            setCurrentFrameIdx(index);
        }
    };

    const updatePixels = pixels => {
        const allHistory = cloneDeep(history);
        
        allHistory[currentFrameIdx].push(pixels);

        updateFrameHistory(allHistory);
    };

    const onPixelPress = idx => {
        if (isLongPressActive) {
            setIsLongPressActive(false);
            
            return false;
        }

        const lastHistory = last(frameHistory) || {};

        if (lastHistory[idx] === currentColor) {
            return false;
        }

        const pixels = cloneDeep(lastHistory);
        
        pixels[idx] = currentColor;

        updatePixels(pixels);
    };

    const onPixelLongPress = idx => {
        const lastHistory = last(frameHistory) || {};
        const pixels = cloneDeep(lastHistory);
        
        setIsLongPressActive(true);

        delete pixels[idx];

        updatePixels(pixels);
    };

    const onUndoPress = () => {
        const allHistory = cloneDeep(history);

        allHistory[currentFrameIdx].pop();

        updateFrameHistory(allHistory);
    };

    const onClearPress = () => {
        const allHistory = cloneDeep(history);

        allHistory[currentFrameIdx] = [];

        updateFrameHistory(allHistory);
    };

    const onCloseLayerMenu = () => {
        setLayerMenuAnchor(null);
        setIsLayerMenuVisible(false);
    };

    const onShowLayerMenuPress = e => {
        e.target.measure((fx, fy, width, height, px, py) => {
            setLayerMenuAnchor({x: px, y: py});
            setIsLayerMenuVisible(true);
        });
    };

    const addLayer = copyCurrent => {
        const allHistory = cloneDeep(history);
        const newIndex = frames.length;

        allHistory[newIndex] = [];

        if (copyCurrent) {
            const pixelHistory = cloneDeep(allHistory[currentFrameIdx]);
            const starting = last(pixelHistory) || {};
            
            allHistory[newIndex].push(starting);
        }

        updateFrameHistory(allHistory, newIndex);
    };

    const onAddLayerPress = () => {
        onCloseLayerMenu();
        addLayer(false);
    };

    const onCopyLayerPress = () => {
        onCloseLayerMenu();
        addLayer(true);
    };

    const onRemoveLayerPress = () => {
        const allHistory = cloneDeep(history);
        const newIndex = currentFrameIdx === 0 ? 0 : currentFrameIdx - 1;

        allHistory.splice(currentFrameIdx, 1);

        onCloseLayerMenu();
        updateFrameHistory(allHistory, newIndex, true);
    };

    const onPreviousFramePress = () => {
        setCurrentFrameIdx(currentFrameIdx - 1);
    };

    const onNextFramePress = () => {
        setCurrentFrameIdx(currentFrameIdx + 1);
    };

    const onSetThumbPress = () => {
        const allFrames = cloneDeep(frames);

        allFrames.forEach((frame, idx) => {
            frame.isThumb = idx === currentFrameIdx;
        });

        setFrames(allFrames);
    };

    const onGridLayout = e => {
        const {height: viewHeight, width: viewWidth, y: viewY} = e.nativeEvent.layout;
        const width = viewWidth / 8;
        const height = viewHeight / 8;
        const spec = nodes.map((num, idx) => {
            const row = Math.floor(idx / 8);
            const startPos = idx % 8;
            const left = startPos * width;
            const right = left + width;
            const top = (row * height) + viewY;
            const bottom = top + height;

            return {bottom, left, index: idx, right, top};
        });

        setGridSpec({
            viewTop: viewY,
            spec
        });
    };

    const onDialogClose = () => {
        setIsTestDialogOpen(false);
        setIsSaveDialogOpen(false);
    };

    const onTestFeelPress = async() => {
        const frame = frames[currentFrameIdx];

        await testFeel({
            variables: {
                feel: {
                    duration: 0,
                    frames: [frame],
                    repeat: false,
                    reverse: false
                }
            }
        });
    };

    const onTestFramesPress = async() => {
        await testFeel({
            variables: {
                feel: {
                    duration: Number(testDuration),
                    frames,
                    repeat: testRepeat,
                    reverse: testReverse
                }
            }
        });

        onDialogClose();
    };

    const onSavePress = async() => {
        const data = {
            categories,
            duration: Number(duration),
            frames,
            name,
            private: isPrivate,
            repeat,
            reverse
        };

        if (_id) {
            await editFeel({
                variables: {_id, data}
            });
        } else {
            const result = await addFeel({
                refetchQueries: [{
                    fetchPolicy: 'network-only',
                    query: getFeels
                }],
                variables: {data}
            });
            const newId = get(result, 'data.addFeel._id');

            navigation.navigate('feel', {_id: newId});
        }

        show('Feel was saved successfully!');

        onDialogClose();
    };

    useEffect(() => {
        const {navigation} = props;
        const actions = [
            <IconButton icon="remote" onPress={onTestFeelPress} key="test" />,
            <IconButton icon="content-save" key="save" onPress={() => setIsSaveDialogOpen(true)} />
        ];

        if (frames.length > 1) {
            actions.splice(1, 0, 
                <IconButton icon="animation-play-outline" onPress={() => setIsTestDialogOpen(true)} key="test-animation" />
            );
        }

        navigation.setOptions({actions});
    });

    if (isLoading) {
        return (
            <Loading loading={true} text="Getting your Feel..." />
        );
    }

    return (
        <Container>
            <Toolbar>
                <IconButton icon="undo" onPress={onUndoPress} disabled={frameHistory.length < 2} />
                <IconButton icon="notification-clear-all" onPress={onClearPress} disabled={!frameHistory.length}  />
                <IconButton icon="chevron-left" disabled={currentFrameIdx === 0} onPress={onPreviousFramePress} />
                <IconButton icon="chevron-right" disabled={frames.length === 1 || currentFrameIdx === frames.length - 1} onPress={onNextFramePress} />
                <IconButton icon="layers-plus" onPress={onShowLayerMenuPress} />
                <IconButton icon="image-album" iconColor={isThumb ? theme.colors.accent : undefined} onPress={onSetThumbPress} />
                <Paragraph style={styles.frameCount}>{currentFrameIdx + 1} / {frames.length}</Paragraph>
            </Toolbar>
            <View style={styles.checkerboard} {...panResponder.panHandlers} onLayout={onGridLayout} ref={canvas}>
                {nodes.map((num, idx) => {
                    const row = Math.floor(idx / 8);
                    const pixel = activePixels[idx];

                    let pixelStyle;

                    if (idx % 2 === 0 && row % 2 === 0) {
                        pixelStyle = 'even';
                    } else if (idx % 2 !== 0 && row % 2 !== 0) {
                        pixelStyle = 'even';
                    } else {
                        pixelStyle = 'odd';
                    }

                    const style = {...styles[pixelStyle]};

                    if (pixel) {
                        style.backgroundColor = pixel;
                    }

                    return (
                        <TouchableWithoutFeedback                             
                            key={`pixel-${idx}`}
                            onPress={onPixelPress.bind(null, idx)}
                            onLongPress={onPixelLongPress.bind(null, idx)}>
                            <View style={style} />
                        </TouchableWithoutFeedback>
                    );
                })}
            </View>
            <TriangleColorPicker
                color={currentColor}
                onColorChange={onColorChange}
                style={styles.colorPicker} />
            <Menu visible={isLayerMenuVisible} onDismiss={onCloseLayerMenu} anchor={layerMenuAnchor}>
                <Menu.Item icon="plus" onPress={onAddLayerPress} title="Add Frame" />
                <Divider />
                <Menu.Item icon="flip-to-back" onPress={onCopyLayerPress} title="Copy Frame" />
                {frames.length > 1 &&
                    <>
                        <Divider />
                        <Menu.Item icon="close" onPress={onRemoveLayerPress} title="Remove Frame" />
                    </>
                }
            </Menu>
            <Dialog
                isOpen={isTestDialogOpen}
                title="Test All Frames"
                onCancelPress={onDialogClose}
                onDialogClose={onDialogClose}
                onSavePress={onTestFramesPress}
                closeText="Close"
                saveText="Test">
                <TextInput 
                    mode="outlined" 
                    label="Frame Length (ms)" 
                    dense={true}
                    value={testDuration} 
                    keyboardType="numeric"
                    onChangeText={duration => setTestDuration(duration)} />
                <View style={styles.switchWrap}>
                    <Switch value={testRepeat} onValueChange={isOn => setTestRepeat(isOn)} />
                    <Text style={styles.label}>Repeat?</Text>
                </View>
                <View style={styles.switchWrap}>
                    <Switch value={testReverse} onValueChange={isOn => setTestReverse(isOn)} />
                    <Text style={styles.label}>Reverse?</Text>
                </View>
            </Dialog>
            <Dialog
                isOpen={isSaveDialogOpen}
                title="Save Feel"
                onCancelPress={onDialogClose}
                onDialogClose={onDialogClose}
                onSavePress={onSavePress}
                saveText="Save">
                <TextInput 
                    mode="outlined" 
                    label="Name" 
                    dense={true}
                    value={name} 
                    onChangeText={value => setName(value)} />
                <Spacer />
                <CategoryPicker onSelectionChange={value => setCategories(value)} mode="form" />
                {frames.length > 1 &&
                    <>
                        <Spacer />
                        <TextInput 
                            mode="outlined" 
                            dense={true}
                            label="Frame Length (ms)" 
                            value={duration} 
                            keyboardType="numeric"
                            onChangeText={value => setDuration(value)} />
                        <Spacer />
                        <View style={styles.switchWrap}>
                            <Switch value={repeat} onValueChange={isOn => setRepeat(isOn)} />
                            <Text style={styles.label}>Repeat?</Text>
                        </View>
                        <Spacer />
                        <View style={styles.switchWrap}>
                            <Switch value={reverse} onValueChange={isOn => setReverse(isOn)} />
                            <Text style={styles.label}>Reverse?</Text>
                        </View>
                    </>
                }
                <Spacer />
                <View style={styles.switchWrap}>
                    <Switch value={isPrivate} onValueChange={isOn => setIsPrivate(isOn)} />
                    <Text style={styles.label}>Private?</Text>
                </View>
            </Dialog>
        </Container>
    );
};
const basePixel = {
    aspectRatio: 1,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '12.5%'
};
const styles = StyleSheet.create({
    checkerboard: {
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    colorPicker: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 'auto',
        backgroundColor: '#222'
    },
    label: {
        marginTop: 3,
        marginLeft: 10
    },
    switchWrap: {
        flexDirection: 'row',
        flexBasis: '25%',
        marginTop: 10,
        marginBottom: 10
    },
    odd: {
        ...basePixel
    },
    even: {
        ...basePixel,
        backgroundColor: 'black'
    },
    frameCount: {
        fontWeight: 'bold',
        fontSize: 14,
        marginTop: 12,
        marginRight: 15,
        flex: 1,
        textAlign: 'right'
    }
});
