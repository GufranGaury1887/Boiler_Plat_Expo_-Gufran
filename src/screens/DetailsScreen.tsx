import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { SafeAreaWrapper, Button } from "../components/common";
import { DetailsScreenProps } from "../types";
import { theme } from "../constants";
import { formatDateTime } from "../utils";

export const DetailsScreen: React.FC<DetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { itemId, title } = route.params;

  // Mock item data - in a real app, you'd fetch this based on itemId
  const itemData = {
    id: itemId,
    title: title || "Sample Item",
    description:
      "This is a detailed description of the item. It contains comprehensive information about the features, specifications, and other relevant details that users might want to know.",
    image: "https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Item+Image",
    category: "Electronics",
    price: "$299.99",
    rating: 4.5,
    reviews: 128,
    inStock: true,
    createdAt: new Date("2024-01-10T10:30:00Z"),
    updatedAt: new Date("2024-01-15T14:45:00Z"),
    tags: ["Popular", "Featured", "New Arrival"],
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handlePurchase = () => {
    // Handle purchase logic
    console.log("Purchase item:", itemId);
  };

  const handleAddToCart = () => {
    // Handle add to cart logic
    console.log("Add to cart:", itemId);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push("⭐");
    }
    if (hasHalfStar) {
      stars.push("✨");
    }
    return stars.join("");
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: itemData.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {itemData.inStock ? "In Stock" : "Out of Stock"}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{itemData.title}</Text>
            <Text style={styles.price}>{itemData.price}</Text>
          </View>

          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>
              {renderStars(itemData.rating)} {itemData.rating}
            </Text>
            <Text style={styles.reviews}>({itemData.reviews} reviews)</Text>
          </View>

          <View style={styles.tagsContainer}>
            {itemData.tags.map((tag, index) => (
              <View key={`tag-${tag}-${index}`} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{itemData.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Item ID</Text>
              <Text style={styles.detailValue}>{itemData.id}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{itemData.category}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(itemData.createdAt)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Updated</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(itemData.updatedAt)}
              </Text>
            </View>
          </View>

          <View style={styles.actionSection}>
            {itemData.inStock && (
              <>
                <Button
                  title="Purchase Now"
                  onPress={handlePurchase}
                  variant="primary"
                  style={styles.button}
                />

                <Button
                  title="Add to Cart"
                  onPress={handleAddToCart}
                  variant="secondary"
                  style={styles.button}
                />
              </>
            )}

            <Button
              title="Go Back"
              onPress={goBack}
              variant="outline"
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  imageContainer: {
    position: "relative",
    height: 250,
    backgroundColor: theme.colors.surface,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    color: theme.colors.background,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  title: {
    flex: 1,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginRight: theme.spacing.md,
  },
  price: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  rating: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  reviews: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    color: theme.colors.background,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  actionSection: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  button: {
    marginBottom: theme.spacing.sm,
  },
});
