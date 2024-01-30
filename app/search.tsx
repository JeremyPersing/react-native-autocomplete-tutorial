import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export interface SearchResults {
  document: Document;
}

export interface Document {
  _id: string;
  country: string;
  exchange: string;
  exchangeScore: number;
  id: string;
  in_SP_500: number;
  industry: string;
  isActivelyTrading: boolean;
  isEtf: boolean;
  isFund: boolean;
  marketCap: number;
  name: string;
  sector: string;
  ticker: string;
}

export default function SearchScreen() {
  const { top } = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults[]>([]);
  const { width } = useWindowDimensions();

  const getSearchResults = async (text: string) => {
    if (!text) return [];

    const stocks = await fetch(`https://revesta.net/api/search?query=${text}`);
    return await stocks.json();
  };

  useEffect(() => {
    async function fetchStocks() {
      setSearchResults(await getSearchResults(searchQuery));
    }

    fetchStocks();
  }, [searchQuery]);

  const handleSubmit = async (text: string) => {
    const stocks = (await getSearchResults(text)) as SearchResults[];
    if (stocks && stocks?.length > 0)
      return router.push(`/${stocks[0].document.ticker}`);

    alert("No results were found for search.");
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: top }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 10,
        }}
      >
        <Pressable
          style={{ paddingLeft: 10, marginRight: 15 }}
          onPress={() => router.back()}
        >
          {({ pressed }) => (
            <FontAwesome
              name="chevron-left"
              size={25}
              color={"white"}
              style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>

        <TextInput
          mode={"outlined"}
          returnKeyType="search"
          placeholder="Search stocks ..."
          autoFocus
          dense
          style={{ width: "75%" }}
          onChangeText={(text) => setSearchQuery(text)}
          onSubmitEditing={async (e) => {
            await handleSubmit(e.nativeEvent.text);
          }}
        />
      </View>

      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        {searchQuery ? (
          <>
            {searchResults.length === 0 ? (
              <View
                style={{
                  flex: 0.75,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={styles.title}>No Stocks Matching Search</Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.document.ticker}
                renderItem={({ item }) => (
                  <Pressable
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginVertical: 15,
                      paddingHorizontal: 10,
                    }}
                    onPress={() => router.push(`/${item.document.ticker}`)}
                  >
                    <View style={{ width: "75%" }}>
                      <Text style={styles.title}>{item.document.ticker}</Text>
                      <Text>{item.document.name}</Text>
                    </View>

                    <Text style={[styles.title, { paddingTop: 5 }]}>
                      {String.fromCodePoint(
                        ...[...item.document.country.toUpperCase()].map(
                          (x) => 0x1f1a5 + x.charCodeAt(0)
                        )
                      )}
                    </Text>
                  </Pressable>
                )}
              />
            )}
          </>
        ) : (
          <View
            style={{
              flex: 0.75,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={styles.title}>Search Stocks ...</Text>
          </View>
        )}
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
