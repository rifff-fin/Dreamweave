import express from "express";
import {
  getTrendingTagsAnalytics,
  getSharedDreamsAnalytics,
  getLocationHeatmap,
  getDreamTrends,
  getCategoryDistribution,
  getLucidAnalytics,
  getAnalyticsDashboard,
} from "../controllers/analyticsController.js";

const router = express.Router();

// Dashboard
router.get("/dashboard", getAnalyticsDashboard);

// Trending tags
router.get("/trending-tags", getTrendingTagsAnalytics);

// Shared dreams
router.get("/shared-dreams", getSharedDreamsAnalytics);

// Location heatmap
router.get("/locations", getLocationHeatmap);

// Dream trends
router.get("/trends", getDreamTrends);

// Category distribution
router.get("/categories", getCategoryDistribution);

// Lucid dreams
router.get("/lucid", getLucidAnalytics);

export default router;
