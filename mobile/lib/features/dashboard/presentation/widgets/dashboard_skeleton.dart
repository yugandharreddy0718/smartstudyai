import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class DashboardSkeleton extends StatelessWidget {
  const DashboardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(width: 80, height: 16, color: Colors.white),
                      const SizedBox(height: 8),
                      Container(width: 140, height: 24, color: Colors.white),
                    ],
                  ),
                  const CircleAvatar(radius: 25, backgroundColor: Colors.white),
                ],
              ),
            ),
            const SizedBox(height: 30),
            
            // Cards
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Row(
                children: [
                  Expanded(child: Container(height: 100, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))),
                  const SizedBox(width: 16),
                  Expanded(child: Container(height: 100, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))),
                  const SizedBox(width: 16),
                  Expanded(child: Container(height: 100, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)))),
                ],
              ),
            ),
            const SizedBox(height: 30),

            // Continue Learning
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Container(height: 140, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24))),
            ),
            const SizedBox(height: 30),

            // Subjects
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Container(width: 150, height: 24, color: Colors.white),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Row(
                children: [
                  Expanded(child: Container(height: 120, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)))),
                  const SizedBox(width: 16),
                  Expanded(child: Container(height: 120, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
