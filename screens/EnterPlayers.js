import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext'; // Assuming you have the theme context set up
import { useNavigation } from '@react-navigation/native';
import EnterPlayersStyle from '../styles/EnterPlayersStyle';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import CustomPopup from '../Modal/CustomPopup'; // Import your loader
import apiConnection from './apiConnection';

const EnterPlayers = ({ route }) => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const { teamName1, teamId1, teamName2, teamId2 } = route.params; // Get team names from params
    const { apiIp } = apiConnection;

    const [teamNames, setTeamNames] = useState(Array(11).fill('')); // Initialize 11 empty player names
    const [currentTeam, setCurrentTeam] = useState(1); // 1 for team 1, 2 for team 2
    const [team1Players, setTeam1Players] = useState([]); // To store team 1's players
    const [loading, setLoading] = useState(false); // State for loader

    const AvsB = colors.background === '#333' ? require('../assets/icons/AvB.png') : require('../assets/icons/AvB.png');
    const userIcon = colors.background === '#333' ? require('../assets/icons/user_white.png') : require('../assets/icons/user.png');

    // Track how many players are filled for team 1
    const playersEnteredForTeam1 = teamNames.slice(0, 3).filter(name => name !== '').length;
    const playersEnteredForTeam2 = teamNames.slice(0, 3).filter(name => name !== '').length;

    // Determine if the button should be disabled
    const isButtonDisabled = currentTeam === 1
        ? playersEnteredForTeam1 < 2 // Check if at least 2 names are filled for team 1
        : playersEnteredForTeam2 < 2 || playersEnteredForTeam1 !== teamNames.filter(name => name !== '').length; // Check if team 2 has the same number of filled names as team 1

    // Save team 1 data and move to team 2
    const handleNextTeam = async () => {
        if (playersEnteredForTeam1 >= 2) {
            // Save team 1 player names
            setTeam1Players([...teamNames]); // Store team 1 players in state
            setCurrentTeam(2);
            setTeamNames(Array(11).fill('')); // Reset for team 2
            console.log("Team 1 players saved and switched to Team 2.");
        } else {
            Alert.alert('Error', 'Please enter at least 2 players for team 1.');
        }
    };

    // Submit both teams' data
    const handleFinish = async () => {
        if (isButtonDisabled) return;
    
        if (playersEnteredForTeam2 >= 2) {
            setLoading(true); // Show loader
            try {
                console.log("Submitting players for both teams:", {
                    teamId1,
                    teamId2,
                    team1Players,
                    team2Players: teamNames
                });
    
                const response = await axios.post(`${apiIp}/playerName.php`, {
                    teamId1,
                    team1Players,
                    teamId2,
                    team2Players: teamNames,
                });
    
                console.log("Server response:", response.data);
    
                if (response.data.status === 'success') {
                    navigation.navigate('DetailMatch', {
                        teamId1,
                        teamName1,
                        teamId2,
                        teamName2,
                        players: { team1Players, team2Players: teamNames }
                    });
                    // Reset teamNames correctly after submission
                    setTeamNames(Array(11).fill('')); // Reset to an array
                } else {
                    Alert.alert('Error', response.data.message);
                    console.log("Error from server:", response.data.message);
                }
            } catch (error) {
                console.error("Error while submitting players:", error);
                Alert.alert('Error', 'Failed to submit players. Please try again.');
            } finally {
                setLoading(false); // Hide loader
            }
        } else {
            Alert.alert('Error', 'Please enter at least 2 players for team 2.');
        }
    };
    

    const handleChange = (index, value) => {
        const newTeamNames = [...teamNames];
        newTeamNames[index] = value;
        setTeamNames(newTeamNames);
        console.log(`Player name for index ${index} changed to: ${value}`);
    };

    return (
        <ScrollView style={[EnterPlayersStyle.container, { backgroundColor: colors.background }]}>
            <View style={EnterPlayersStyle.header}>
                <View style={EnterPlayersStyle.iconContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                        <AntDesign name="caretleft" size={25} color='#EB001B' />
                    </TouchableOpacity>
                </View>
                <Text style={[EnterPlayersStyle.title, { color: colors.text }]}>Matches</Text>
                <Image source={userIcon} style={EnterPlayersStyle.icon} />
                <Icon name="search" size={23} color="#f79e1b" style={EnterPlayersStyle.iconSearch} />
            </View>

            <View style={EnterPlayersStyle.middleText}>
                <Text style={[EnterPlayersStyle.welTxt, { color: colors.text }]}>
                    Enter {currentTeam === 1 ? teamName1 : teamName2} names
                </Text>
            </View>

            <View style={EnterPlayersStyle.centeredContent}>
                <View style={EnterPlayersStyle.cardContainer}>
                    <LinearGradient
                        colors={['#000000', '#434343']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={EnterPlayersStyle.card}
                    >
                        <View style={[EnterPlayersStyle.AvsBIcon]}>
                            <Image source={AvsB} style={EnterPlayersStyle.cardIcon}></Image>
                        </View>
                    </LinearGradient>

                    {/* Map over teamNames to create 11 input fields */}
                    {teamNames.map((name, index) => (
                        <View key={index} style={EnterPlayersStyle.inputContainer}>
                            <MaterialCommunityIcons name="cricket" size={25} style={EnterPlayersStyle.inputIcon} color={colors.text} />
                            <TextInput
                                style={[EnterPlayersStyle.input, { color: colors.text }]}
                                placeholder={`Player No.${index + 1}`}
                                placeholderTextColor={colors.text}
                                value={name}
                                onChangeText={(value) => handleChange(index, value)}
                            />
                        </View>
                    ))}

                    <TouchableOpacity
                        style={[EnterPlayersStyle.button, { backgroundColor: isButtonDisabled ? 'gray' : 'red' }]}
                        onPress={currentTeam === 1 ? handleNextTeam : handleFinish}
                        disabled={isButtonDisabled}
                    >
                        <Text style={[EnterPlayersStyle.buttonText, { color: 'white' }]}>
                            {currentTeam === 1 ? `Next Team ${teamName2}` : 'Finish'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <CustomPopup visible={loading} message="Loading..." />
        </ScrollView>
    );
};

export default EnterPlayers;