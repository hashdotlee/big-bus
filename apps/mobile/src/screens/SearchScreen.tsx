import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useBookingStore, Route} from '@store/bookingStore';

interface SearchScreenProps {
  navigation: any;
}

const SearchScreen: React.FC<SearchScreenProps> = ({navigation}) => {
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const {searchRoutes, searchResults, isSearching, selectRoute} = useBookingStore();

  const handleSearch = async () => {
    if (!departure || !destination || !date) {
      return;
    }

    try {
      await searchRoutes(departure, destination, date);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleSelectRoute = (route: Route) => {
    selectRoute(route);
    navigation.navigate('SeatSelection');
  };

  const renderRouteItem = ({item}: {item: Route}) => (
    <TouchableOpacity
      style={styles.routeCard}
      onPress={() => handleSelectRoute(item)}
      testID={`route-item-${item.id}`}>
      <View style={styles.routeHeader}>
        <Text style={styles.routeTitle}>
          {item.departure} → {item.destination}
        </Text>
        <Text style={styles.price}>{item.price.toLocaleString()} VND</Text>
      </View>
      <View style={styles.routeDetails}>
        <Text style={styles.time}>
          Departure: {item.departureTime}
        </Text>
        <Text style={styles.time}>
          Arrival: {item.arrivalTime}
        </Text>
      </View>
      <View style={styles.routeFooter}>
        <Text style={styles.vehicleType}>{item.vehicleType}</Text>
        <Text style={styles.availableSeats}>
          {item.availableSeats} seats available
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container} testID="search-screen">
      <View style={styles.searchForm}>
        <Text style={styles.title}>Search Bus Routes</Text>

        <TextInput
          style={styles.input}
          placeholder="Departure City"
          value={departure}
          onChangeText={setDeparture}
          testID="departure-input"
        />

        <TextInput
          style={styles.input}
          placeholder="Destination City"
          value={destination}
          onChangeText={setDestination}
          testID="destination-input"
        />

        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          testID="date-input"
        />

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isSearching}
          testID="search-button">
          {isSearching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {searchResults.length > 0 && (
        <View style={styles.resultsContainer} testID="search-results">
          <Text style={styles.resultsTitle}>
            Found {searchResults.length} routes
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderRouteItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchForm: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    padding: 15,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  routeCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  routeDetails: {
    marginBottom: 10,
  },
  time: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  routeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleType: {
    fontSize: 14,
    color: '#666',
  },
  availableSeats: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
});

export default SearchScreen;
