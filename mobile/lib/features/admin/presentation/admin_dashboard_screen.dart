import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:go_router/go_router.dart';
import '../../authentication/providers/auth_state_provider.dart';
import '../../subjects/providers/curriculum_provider.dart';
import '../../subjects/domain/chapter_model.dart';
import '../../subjects/domain/lesson_model.dart';
import '../../subjects/domain/book_model.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _loadingStats = true;
  int _totalStudents = 0;
  int _totalAdmins = 0;
  List<Map<String, dynamic>> _userList = [];
  String? _statsError;

  // Curriculum management states
  String _selectedClass = '8';
  String _selectedSubject = 'maths';
  List<ChapterModel> _chapters = [];
  List<BookModel> _books = [];
  bool _loadingCurriculum = false;
  String? _curriculumError;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadAdminData();
    _loadCurriculumContent();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAdminData() async {
    setState(() {
      _loadingStats = true;
      _statsError = null;
    });

    try {
      final firestore = ref.read(firestoreProvider);
      final usersSnap = await firestore.collection('users').get();

      final seenStudents = <String, Map<String, dynamic>>{};
      final seenAdmins = <String, Map<String, dynamic>>{};

      for (final doc in usersSnap.docs) {
        final uid = doc.id;
        final data = doc.data();
        final role = (data['role']?.toString() ?? '').trim().toLowerCase();
        final email = (data['email']?.toString() ?? '').trim();
        final isAnonymous =
            data['provider'] == 'anonymous' || data['isAnonymous'] == true;
        final isMock =
            data['isMock'] == true || data['isSample'] == true || data['isDemo'] == true;

        if (role == 'admin' || role == 'superadmin') {
          if (!isMock) {
            seenAdmins[uid] = {...data, 'uid': uid, 'role': role};
          }
        } else if (role == 'student') {
          if (!isAnonymous && email.contains('@') && !isMock) {
            seenStudents[uid] = {...data, 'uid': uid, 'role': role};
          }
        }
      }

      // Remove any admin UIDs from students list
      for (final adminUid in seenAdmins.keys) {
        seenStudents.remove(adminUid);
      }

      final combined = [
        ...seenAdmins.values,
        ...seenStudents.values,
      ];

      if (mounted) {
        setState(() {
          _totalStudents = seenStudents.length;
          _totalAdmins = seenAdmins.length;
          _userList = combined;
          _loadingStats = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _statsError = 'Error loading admin data: $e';
          _loadingStats = false;
        });
      }
    }
  }

  Future<void> _loadCurriculumContent() async {
    setState(() {
      _loadingCurriculum = true;
      _curriculumError = null;
    });

    try {
      final repo = ref.read(curriculumRepositoryProvider);
      final chapters = await repo.getChapters('class_$_selectedClass', _selectedSubject);
      final books = await repo.getBooks('class_$_selectedClass', subjectId: _selectedSubject);

      if (mounted) {
        setState(() {
          _chapters = chapters;
          _books = books;
          _loadingCurriculum = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _curriculumError = 'Failed to load curriculum: $e';
          _loadingCurriculum = false;
        });
      }
    }
  }

  Future<void> _editLessonDialog(ChapterModel chapter, LessonModel lesson) async {
    final titleController = TextEditingController(text: lesson.title);
    final contentController = TextEditingController(text: lesson.contentMarkdown);
    bool saving = false;

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Text(
            'Edit Lesson: ${lesson.id}',
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
          ),
          content: SingleChildScrollView(
            child: SizedBox(
              width: MediaQuery.of(dialogContext).size.width * 0.85,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Title',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: titleController,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF4F46E5), width: 1.5),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Markdown Content',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: contentController,
                    maxLines: 12,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF4F46E5), width: 1.5),
                      ),
                      contentPadding: const EdgeInsets.all(12),
                    ),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: saving ? null : () => Navigator.pop(dialogContext),
              child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B))),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4F46E5),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              onPressed: saving
                  ? null
                  : () async {
                      setDialogState(() => saving = true);
                      try {
                        final firestore = ref.read(firestoreProvider);
                        final targetClassId = 'class_$_selectedClass';
                        final now = DateTime.now().millisecondsSinceEpoch;

                        final payload = {
                          'id': lesson.id,
                          'chapterId': chapter.id,
                          'subjectId': _selectedSubject,
                          'classId': targetClassId,
                          'title': titleController.text.trim(),
                          'content': contentController.text.trim(),
                          'contentMarkdown': contentController.text.trim(),
                          'order': lesson.order,
                          'updatedAt': now,
                        };

                        // 1. Nested hierarchy
                        await firestore
                            .collection('curriculum')
                            .doc(targetClassId)
                            .collection('subjects')
                            .doc(_selectedSubject)
                            .collection('chapters')
                            .doc(chapter.id)
                            .collection('lessons')
                            .doc(lesson.id)
                            .set(payload, SetOptions(merge: true));

                        // 2. Top-level lessons collection (optional sync)
                        try {
                          await firestore
                              .collection('lessons')
                              .doc(lesson.id)
                              .set(payload, SetOptions(merge: true));
                        } catch (topErr) {
                          debugPrint('Notice: top-level lessons sync notice: $topErr');
                        }

                        if (dialogContext.mounted) {
                          Navigator.pop(dialogContext);
                        }
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Lesson updated successfully in Firestore!'),
                              backgroundColor: Color(0xFF10B981),
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                          _loadCurriculumContent();
                        }
                      } catch (e) {
                        setDialogState(() => saving = false);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Save error: $e'),
                              backgroundColor: const Color(0xFFF43F5E),
                            ),
                          );
                        }
                      }
                    },
              child: saving
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _updateUserRoleDialog(Map<String, dynamic> targetUser) async {
    final authState = ref.read(authStateProvider);
    final currentUser = authState.user;
    if (currentUser?.isSuperAdmin != true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Only SuperAdmins have permission to modify user roles.'),
          backgroundColor: Color(0xFFF59E0B),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final targetUid = targetUser['uid']?.toString() ?? '';
    final currentRole = targetUser['role']?.toString().toLowerCase() ?? 'student';
    String newRole = currentRole == 'admin' ? 'student' : 'admin';

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Change User Role', style: TextStyle(fontWeight: FontWeight.w800)),
        content: Text(
          'Change role of ${targetUser['displayName'] ?? targetUser['email']} from "$currentRole" to "$newRole"?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4F46E5),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Confirm', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final firestore = ref.read(firestoreProvider);
        await firestore.collection('users').doc(targetUid).update({
          'role': newRole,
          'updatedAt': DateTime.now().millisecondsSinceEpoch,
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('User role updated to $newRole!'),
              backgroundColor: const Color(0xFF10B981),
              behavior: SnackBarBehavior.floating,
            ),
          );
          _loadAdminData();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to update role: $e'),
              backgroundColor: const Color(0xFFF43F5E),
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final user = authState.user;

    // Safety guard: Non-admins cannot view this screen
    if (user?.isAdmin != true) {
      return Scaffold(
        appBar: AppBar(title: const Text('Access Denied')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.lock_rounded, size: 64, color: Color(0xFFF43F5E)),
                const SizedBox(height: 16),
                const Text(
                  'Administrator Access Required',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Your account does not have administrator privileges.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => context.go('/dashboard'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Back to Dashboard'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final isSuperAdmin = user!.isSuperAdmin;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF0F172A)),
          onPressed: () => context.pop(),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFEEF2FF),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.admin_panel_settings_rounded,
                color: Color(0xFF4F46E5),
                size: 20,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                isSuperAdmin ? 'SuperAdmin Console' : 'Admin Console',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Color(0xFF0F172A),
                  fontWeight: FontWeight.w800,
                  fontSize: 18,
                  letterSpacing: -0.3,
                ),
              ),
            ),
          ],
        ),
        actions: [
          Tooltip(
            message: 'Refresh data',
            child: IconButton(
              icon: const Icon(Icons.refresh_rounded, color: Color(0xFF4F46E5)),
              onPressed: () {
                _loadAdminData();
                _loadCurriculumContent();
              },
            ),
          ),
          const SizedBox(width: 4),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: TabBar(
              controller: _tabController,
              labelColor: const Color(0xFF4F46E5),
              unselectedLabelColor: const Color(0xFF64748B),
              indicatorColor: const Color(0xFF4F46E5),
              indicatorWeight: 3,
              indicatorSize: TabBarIndicatorSize.tab,
              labelStyle: const TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 13,
                letterSpacing: 0.1,
              ),
              unselectedLabelStyle: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
              tabs: const [
                Tab(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.dashboard_rounded, size: 16),
                      SizedBox(width: 6),
                      Text('Overview'),
                    ],
                  ),
                ),
                Tab(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.menu_book_rounded, size: 16),
                      SizedBox(width: 6),
                      Text('Curriculum'),
                    ],
                  ),
                ),
                Tab(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.people_alt_rounded, size: 16),
                      SizedBox(width: 6),
                      Text('Users & Roles'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(),
          _buildCurriculumTab(),
          _buildUsersTab(),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    if (_loadingStats) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF4F46E5)));
    }

    if (_statsError != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline_rounded, color: Color(0xFFF43F5E), size: 48),
              const SizedBox(height: 12),
              Text(
                _statsError!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadAdminData,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  foregroundColor: Colors.white,
                ),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadAdminData,
      color: const Color(0xFF4F46E5),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF4338CA), Color(0xFF6366F1)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF4F46E5).withValues(alpha: 0.25),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Mobile Admin Portal',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.2,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Full synchronization with web curriculum & Firestore backend.',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.cloud_done_rounded, color: Colors.white, size: 28),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'Real-Time Platform Statistics',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
                letterSpacing: -0.2,
              ),
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'Registered Students',
                    _totalStudents.toString(),
                    Icons.school_rounded,
                    const Color(0xFFEEF2FF),
                    const Color(0xFF4F46E5),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'System Admins',
                    _totalAdmins.toString(),
                    Icons.shield_rounded,
                    const Color(0xFFECFDF5),
                    const Color(0xFF10B981),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'Subjects',
                    '6',
                    Icons.category_rounded,
                    const Color(0xFFFFF7ED),
                    const Color(0xFFF97316),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard(
                    'Curriculum Chapters',
                    _chapters.isNotEmpty ? '${_chapters.length}' : '178',
                    Icons.auto_stories_rounded,
                    const Color(0xFFFDF2F8),
                    const Color(0xFFEC4899),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            const Text(
              'Quick Admin Controls',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
                letterSpacing: -0.2,
              ),
            ),
            const SizedBox(height: 12),

            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 4),
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEEF2FF),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.edit_note_rounded, color: Color(0xFF4F46E5), size: 22),
                    ),
                    title: const Text(
                      'Manage Curriculum Content',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                    ),
                    subtitle: const Text(
                      'Edit lesson markdown, review chapters & books',
                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                    onTap: () => _tabController.animateTo(1),
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                  ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 4),
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.manage_accounts_rounded, color: Color(0xFF10B981), size: 22),
                    ),
                    title: const Text(
                      'Manage Students & Roles',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                    ),
                    subtitle: const Text(
                      'View registered students, update permissions',
                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                    onTap: () => _tabController.animateTo(2),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(
    String label,
    String value,
    IconData icon,
    Color bg,
    Color iconColor,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(height: 12),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
                letterSpacing: -0.5,
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF64748B),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurriculumTab() {
    final classes = ['6', '7', '8', '9', '10'];
    final subjects = [
      {'id': 'maths', 'name': 'Mathematics', 'icon': '📐'},
      {'id': 'physics', 'name': 'Physics', 'icon': '⚡'},
      {'id': 'chemistry', 'name': 'Chemistry', 'icon': '🧪'},
      {'id': 'biology', 'name': 'Biology', 'icon': '🌿'},
      {'id': 'history', 'name': 'History', 'icon': '🏛️'},
      {'id': 'geography', 'name': 'Geography', 'icon': '🌍'},
    ];

    return Column(
      children: [
        // Filter Bar with Responsive Horizontal Scrolling & High Contrast
        Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Class Selection Label & Horizontally Scrollable Chips
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  children: const [
                    Icon(Icons.school_outlined, size: 16, color: Color(0xFF475569)),
                    SizedBox(width: 6),
                    Text(
                      'Select Class',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        color: Color(0xFF475569),
                        letterSpacing: 0.3,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: classes.map((c) {
                    final isSelected = c == _selectedClass;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: InkWell(
                        onTap: () {
                          if (!isSelected) {
                            setState(() => _selectedClass = c);
                            _loadCurriculumContent();
                          }
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF4F46E5) : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected
                                  ? const Color(0xFF4F46E5)
                                  : const Color(0xFFCBD5E1),
                              width: 1.5,
                            ),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: const Color(0xFF4F46E5).withValues(alpha: 0.25),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    )
                                  ]
                                : null,
                          ),
                          child: Text(
                            'Class $c',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                              color: isSelected ? Colors.white : const Color(0xFF1E293B),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 12),

              // Subject Selection Label & Horizontally Scrollable Chips
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  children: const [
                    Icon(Icons.category_outlined, size: 16, color: Color(0xFF475569)),
                    SizedBox(width: 6),
                    Text(
                      'Select Subject',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        color: Color(0xFF475569),
                        letterSpacing: 0.3,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: subjects.map((s) {
                    final isSelected = s['id'] == _selectedSubject;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: InkWell(
                        onTap: () {
                          if (!isSelected) {
                            setState(() => _selectedSubject = s['id']!);
                            _loadCurriculumContent();
                          }
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF4F46E5) : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected
                                  ? const Color(0xFF4F46E5)
                                  : const Color(0xFFCBD5E1),
                              width: 1.5,
                            ),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: const Color(0xFF4F46E5).withValues(alpha: 0.25),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    )
                                  ]
                                : null,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(s['icon']!, style: const TextStyle(fontSize: 13)),
                              const SizedBox(width: 6),
                              Text(
                                s['name']!,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                  color: isSelected ? Colors.white : const Color(0xFF1E293B),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),

        // Chapters & Lessons List
        Expanded(
          child: _loadingCurriculum
              ? const Center(
                  child: CircularProgressIndicator(color: Color(0xFF4F46E5)),
                )
              : _curriculumError != null
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline_rounded,
                                color: Color(0xFFF43F5E), size: 40),
                            const SizedBox(height: 12),
                            Text(
                              _curriculumError!,
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Color(0xFF64748B)),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _loadCurriculumContent,
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadCurriculumContent,
                      color: const Color(0xFF4F46E5),
                      child: ListView(
                        padding: const EdgeInsets.all(16),
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: [
                          if (_books.isNotEmpty) ...[
                            Row(
                              children: [
                                const Icon(Icons.menu_book_rounded,
                                    size: 16, color: Color(0xFF4F46E5)),
                                const SizedBox(width: 6),
                                const Text(
                                  'Textbooks (Firestore Storage)',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 14,
                                    color: Color(0xFF0F172A),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            ..._books.map((b) => Card(
                                  elevation: 0,
                                  margin: const EdgeInsets.only(bottom: 8),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16),
                                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                                  ),
                                  child: ListTile(
                                    leading: Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFFF1F2),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: const Icon(Icons.picture_as_pdf_rounded,
                                          color: Color(0xFFF43F5E), size: 20),
                                    ),
                                    title: Text(
                                      b.title,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 13,
                                      ),
                                    ),
                                    subtitle: Text(
                                      '${(b.fileSizeBytes / (1024 * 1024)).toStringAsFixed(1)} MB • ${b.status}',
                                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                    ),
                                    trailing: const Icon(Icons.open_in_new_rounded,
                                        size: 18, color: Color(0xFF94A3B8)),
                                  ),
                                )),
                            const SizedBox(height: 16),
                          ],
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Chapters (${_chapters.length})',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 14,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              Container(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEEF2FF),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'Tap chapter to view/edit lessons',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF4F46E5),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          if (_chapters.isEmpty)
                            Center(
                              child: Padding(
                                padding: const EdgeInsets.all(36.0),
                                child: Column(
                                  children: [
                                    const Icon(Icons.auto_stories_outlined,
                                        size: 48, color: Color(0xFFCBD5E1)),
                                    const SizedBox(height: 12),
                                    const Text(
                                      'No chapters found for this subject and class.',
                                      style: TextStyle(
                                        color: Color(0xFF64748B),
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          else
                            ..._chapters.map((ch) => _buildChapterExpansionTile(ch)),
                          const SizedBox(height: 16),
                        ],
                      ),
                    ),
        ),
      ],
    );
  }

  Widget _buildChapterExpansionTile(ChapterModel chapter) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          leading: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: const Color(0xFFEEF2FF),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFC7D2FE)),
            ),
            child: Center(
              child: Text(
                chapter.order.toString(),
                style: const TextStyle(
                  color: Color(0xFF4F46E5),
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                ),
              ),
            ),
          ),
          title: Text(
            chapter.title,
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 14,
              color: Color(0xFF0F172A),
              letterSpacing: -0.2,
            ),
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 4.0),
            child: Text(
              chapter.description.isNotEmpty
                  ? chapter.description
                  : 'Curriculum lessons and interactive study material.',
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF64748B),
                height: 1.35,
              ),
            ),
          ),
          iconColor: const Color(0xFF4F46E5),
          collapsedIconColor: const Color(0xFF94A3B8),
          children: [
            Container(
              decoration: const BoxDecoration(
                color: Color(0xFFF8FAFC),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(18),
                  bottomRight: Radius.circular(18),
                ),
              ),
              child: FutureBuilder<List<LessonModel>>(
                future: ref.read(curriculumRepositoryProvider).getLessons(
                      'class_$_selectedClass',
                      _selectedSubject,
                      chapter.id,
                    ),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Padding(
                      padding: EdgeInsets.all(20.0),
                      child: Center(
                        child: SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Color(0xFF4F46E5),
                          ),
                        ),
                      ),
                    );
                  }

                  final lessons = snapshot.data ?? [];
                  if (lessons.isEmpty) {
                    return const Padding(
                      padding: EdgeInsets.all(20.0),
                      child: Center(
                        child: Text(
                          'No lessons found in this chapter.',
                          style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                        ),
                      ),
                    );
                  }

                  return Column(
                    children: lessons.map((l) {
                      return Container(
                        decoration: const BoxDecoration(
                          border: Border(
                            top: BorderSide(color: Color(0xFFF1F5F9)),
                          ),
                        ),
                        child: ListTile(
                          contentPadding:
                              const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                          leading: Container(
                            padding: const EdgeInsets.all(7),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: const Icon(
                              Icons.article_outlined,
                              size: 18,
                              color: Color(0xFF4F46E5),
                            ),
                          ),
                          title: Text(
                            l.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          subtitle: Text(
                            'ID: ${l.id} • ${l.estimatedMinutes} min',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF94A3B8),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          trailing: Tooltip(
                            message: 'Edit Lesson Markdown',
                            child: InkWell(
                              onTap: () => _editLessonDialog(chapter, l),
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEEF2FF),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: const Color(0xFFC7D2FE)),
                                ),
                                child: const Icon(
                                  Icons.edit_rounded,
                                  color: Color(0xFF4F46E5),
                                  size: 16,
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUsersTab() {
    final authState = ref.watch(authStateProvider);
    final isSuperAdmin = authState.user?.isSuperAdmin == true;

    return RefreshIndicator(
      onRefresh: _loadAdminData,
      color: const Color(0xFF4F46E5),
      child: ListView(
        padding: const EdgeInsets.all(16),
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFEEF2FF),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFC7D2FE)),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline_rounded, color: Color(0xFF4F46E5), size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    isSuperAdmin
                        ? 'SuperAdmin mode: Tap a user card to modify role permissions.'
                        : 'Admin view: Registered users loaded dynamically from Firestore.',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF3730A3),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (_userList.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(32.0),
                child: Text(
                  'No registered users found.',
                  style: TextStyle(color: Color(0xFF64748B)),
                ),
              ),
            )
          else
            ..._userList.map((u) {
              final role = u['role']?.toString().toLowerCase() ?? 'student';
              final isAdminRole = role == 'admin' || role == 'superadmin';
              final name =
                  u['displayName'] ?? u['name'] ?? u['email']?.toString().split('@')[0] ?? 'User';
              final email = u['email'] ?? 'No email';
              final grade = u['studentClass'] ?? u['grade'] ?? '8';

              return Card(
                elevation: 0,
                margin: const EdgeInsets.only(bottom: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18),
                  side: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  leading: CircleAvatar(
                    backgroundColor:
                        isAdminRole ? const Color(0xFFEEF2FF) : const Color(0xFFF1F5F9),
                    child: Icon(
                      isAdminRole ? Icons.shield_rounded : Icons.person_rounded,
                      color: isAdminRole ? const Color(0xFF4F46E5) : const Color(0xFF64748B),
                    ),
                  ),
                  title: Row(
                    children: [
                      Expanded(
                        child: Text(
                          name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: isAdminRole ? const Color(0xFFECFDF5) : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isAdminRole ? const Color(0xFFA7F3D0) : const Color(0xFFE2E8F0),
                          ),
                        ),
                        child: Text(
                          role.toUpperCase(),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: isAdminRole ? const Color(0xFF059669) : const Color(0xFF64748B),
                            letterSpacing: 0.3,
                          ),
                        ),
                      ),
                    ],
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 3),
                      Text(
                        email,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Grade $grade • UID: ${u['uid']?.toString().substring(0, u['uid'].toString().length >= 8 ? 8 : u['uid'].toString().length)}...',
                        style: const TextStyle(
                          fontSize: 10,
                          color: Color(0xFF94A3B8),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  trailing: isSuperAdmin && role != 'superadmin'
                      ? IconButton(
                          icon: const Icon(Icons.swap_horiz_rounded, color: Color(0xFF4F46E5)),
                          tooltip: 'Change Role',
                          onPressed: () => _updateUserRoleDialog(u),
                        )
                      : null,
                ),
              );
            }),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
