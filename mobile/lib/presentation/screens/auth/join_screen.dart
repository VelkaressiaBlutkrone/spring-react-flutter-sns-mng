// 회원가입 화면. doc/API_SPEC.md 2(회원), TASK_MOBILE Step 3·4
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/di/app_providers.dart';
import '../../../core/error/app_exception.dart';
import '../../../core/logger/app_logger.dart';
import '../../../domain/models/models.dart';
import '../../../shared/utils/validation.dart';

/// 회원가입 화면
class JoinScreen extends StatefulWidget {
  const JoinScreen({super.key});

  @override
  State<JoinScreen> createState() => _JoinScreenState();
}

class _JoinScreenState extends State<JoinScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nicknameController = TextEditingController();

  String? _emailError;
  String? _passwordError;
  String? _nicknameError;
  String? _generalError;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nicknameController.dispose();
    super.dispose();
  }

  void _clearFieldErrors() {
    setState(() {
      _emailError = null;
      _passwordError = null;
      _nicknameError = null;
      _generalError = null;
    });
  }

  Future<void> _submit() async {
    _clearFieldErrors();
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      await memberRepository.join(
        MemberJoinRequest(
          email: _emailController.text.trim(),
          password: _passwordController.text,
          nickname: _nicknameController.text.trim(),
        ),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('가입 완료. 로그인해 주세요.')),
      );
      context.pop();
    } on AppException catch (e) {
      if (!mounted) return;
      logDebug('JoinScreen', '회원가입 실패: ${e.message}', e);
      setState(() {
        _isLoading = false;
        _generalError = e.message;
        if (e is ApiException && e.fieldErrors != null) {
          for (final fe in e.fieldErrors!) {
            if (fe.field == 'email') _emailError = fe.reason;
            if (fe.field == 'password') _passwordError = fe.reason;
            if (fe.field == 'nickname') _nicknameError = fe.reason;
          }
        }
      });
    } catch (e, st) {
      if (!mounted) return;
      logDebug('JoinScreen', '회원가입 예외', e, st);
      setState(() {
        _isLoading = false;
        _generalError = e is NetworkException
            ? '서버에 연결할 수 없습니다. Backend 실행 여부와 CORS를 확인하세요.'
            : '오류가 발생했습니다: ${e.toString()}';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('회원가입')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 32),
                TextFormField(
                  controller: _emailController,
                  decoration: InputDecoration(
                    labelText: '이메일',
                    errorText: _emailError,
                    border: const OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.emailAddress,
                  autocorrect: false,
                  validator: (v) {
                    if (v == null || v.isEmpty) return '이메일을 입력하세요.';
                    if (!isValidEmail(v)) return '올바른 이메일 형식이 아닙니다.';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  decoration: InputDecoration(
                    labelText: '비밀번호 (8자 이상)',
                    errorText: _passwordError,
                    border: const OutlineInputBorder(),
                  ),
                  obscureText: true,
                  validator: (v) {
                    if (v == null || v.isEmpty) return '비밀번호를 입력하세요.';
                    if (!isValidPassword(v)) {
                      return '비밀번호는 8자 이상이어야 합니다.';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _nicknameController,
                  decoration: InputDecoration(
                    labelText: '닉네임',
                    errorText: _nicknameError,
                    border: const OutlineInputBorder(),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return '닉네임을 입력하세요.';
                    if (!isValidNickname(v)) return '닉네임을 입력하세요.';
                    return null;
                  },
                ),
                if (_generalError != null) ...[
                  const SizedBox(height: 16),
                  Text(
                    _generalError!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                ],
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('가입'),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => context.pop(),
                  child: const Text('로그인으로 돌아가기'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
