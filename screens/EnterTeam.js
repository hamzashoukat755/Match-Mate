import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext'; // Assuming you have the theme context set up
import { useNavigation } from '@react-navigation/native';
import EnterTeamStyle from '../styles/EnterTeamStyle';
import Icon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LinearGradient from 'react-native-linear-gradient';
import CustomPopup from '../Modal/CustomPopup'; // Import your loader
import axios from 'axios'; // Import axios
import apiConnection from './apiConnection';

const EnterTeam = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [teamName1, setTeam1] = useState('');
    const [teamName2, setTeam2] = useState('');
    const [loading, setLoading] = useState(false); // State for loader
    const { apiIp } = apiConnection;

    const isButtonDisabled = !(teamName1 && teamName2) || teamName1 === teamName2; // Check if both fields are filled
    // Determine the profile and lock icon based on the theme
    const AvsB = colors.background === '#333' ? require('../assets/icons/AvB.png') : require('../assets/icons/AvB.png');
    const userIcon = colors.background === '#333' ? require('../assets/icons/user_white.png') : require('../assets/icons/user.png');
    const teamIcon = colors.background === '#333' ? require('../assets/icons/teamIcon.png') : require('../assets/icons/teamIcon.png');
    // Function to handle team submission
    const handleTeam = async () => {
        if (isButtonDisabled) return;

        setLoading(true); // Show loader

        try {
            const response = await axios.post(`${apiIp}/teamName.php`, {
                teamName1,
                teamName2
            });

            const result = response.data;

            if (result.status === 'success') {
                // Get team IDs from the response
                const teamId1 = result.team1.id;
                const teamId2 = result.team2.id;
                navigation.navigate('EnterPlayers', { teamName1, teamId1, teamName2, teamId2 });
                console.log(result.message);
                setTeam1('');
                setTeam2('');
            } else {
                console.log(result.message);
                Alert.alert('Error', result.message); // Show error message if any
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again later.');
        } finally {
            setLoading(false); // Hide loader
        }
    };

    return (
        <ScrollView style={[EnterTeamStyle.container, { backgroundColor: colors.background }]}>
            <View style={EnterTeamStyle.header}>
                <View style={EnterTeamStyle.iconContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <AntDesign name="caretleft" size={25} color='#EB001B' />
                    </TouchableOpacity>
                </View>
                <Text style={[EnterTeamStyle.title, { color: colors.text }]}>Matches</Text>
                <Image source={userIcon} style={EnterTeamStyle.icon} />
                <Icon name="search" size={23} color="#f79e1b" style={EnterTeamStyle.iconSearch} />
            </View>

            <View style={EnterTeamStyle.middleText}>
                <Text style={[EnterTeamStyle.welTxt, { color: colors.text }]}>Enter Teams Name</Text>
            </View>
            <View style={EnterTeamStyle.centeredContent}>
                <View style={EnterTeamStyle.cardContainer}>
                    <LinearGradient
                        colors={['#000000', '#434343']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={EnterTeamStyle.card}
                    >
                        <View style={[EnterTeamStyle.AvsBIcon]}>
                            <Image source={AvsB} style={EnterTeamStyle.cardIcon}></Image>
                        </View>
                    </LinearGradient>

                    <View style={EnterTeamStyle.inputContainer}>
                        <Image source={teamIcon} style={EnterTeamStyle.inputIcon} />
                        <TextInput
                            style={[EnterTeamStyle.input, { color: colors.text }]}
                            placeholder="ENTER TEAM-1 NAME HERE"
                            placeholderTextColor={colors.text}
                            value={teamName1}
                            onChangeText={setTeam1}
                        />
                    </View>

                    <View style={EnterTeamStyle.inputContainer}>
                        <Image source={teamIcon} style={EnterTeamStyle.inputIcon} />
                        <TextInput
                            style={[EnterTeamStyle.input, { color: colors.text }]}
                            placeholder="ENTER TEAM-2 NAME HERE"
                            placeholderTextColor={colors.text}
                            value={teamName2}
                            onChangeText={setTeam2}
                        />
                    </View>

                    <TouchableOpacity
                        style={[EnterTeamStyle.button, { backgroundColor: isButtonDisabled ? 'gray' : 'red' }]}
                        onPress={handleTeam}
                        disabled={isButtonDisabled} // Disable button if fields are not filled
                    >
                        <Text style={[EnterTeamStyle.buttonText, { color: 'white' }]}>
                            START NEW MATCH
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Loader popup */}
            <CustomPopup visible={loading} message="Loading..." />
        </ScrollView>
    );
};

export default EnterTeam;