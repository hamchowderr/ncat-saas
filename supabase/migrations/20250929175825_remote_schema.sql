drop trigger if exists "update_app_settings_updated_at" on "public"."app_settings";

drop trigger if exists "update_files_updated_at" on "public"."files";

drop trigger if exists "update_jobs_updated_at" on "public"."jobs";

drop policy "Service role can manage all billing subscriptions" on "public"."billing_subscriptions";

drop policy "Users can insert billing subscriptions for their workspace" on "public"."billing_subscriptions";

drop policy "Users can update their workspace billing subscriptions" on "public"."billing_subscriptions";

drop policy "Users can view their workspace billing subscriptions" on "public"."billing_subscriptions";

drop policy "Admins can view settings" on "public"."app_settings";

drop policy "Users can insert billing customer records for their workspace" on "public"."billing_customers";

drop policy "Users can update their own billing customer records" on "public"."billing_customers";

drop policy "Users can view their own billing customer records" on "public"."billing_customers";

drop policy "Published blog posts are visible to everyone" on "public"."marketing_blog_posts";

drop policy "Workspace members can view projects" on "public"."projects";

drop policy "Workspace admins can access settings" on "public"."workspace_admin_settings";

drop policy "Workspace members can access settings" on "public"."workspace_application_settings";

drop policy "Workspace members can view credits" on "public"."workspace_credits";

drop policy "Workspace admins can view credit logs" on "public"."workspace_credits_logs";

drop policy "Workspace admins can manage invitations" on "public"."workspace_invitations";

drop policy "Workspace admins can manage team members" on "public"."workspace_members";

drop policy "Workspace members can read team members" on "public"."workspace_members";

drop policy "Workspace members can access settings" on "public"."workspace_settings";

drop policy "Workspace members can read their workspaces" on "public"."workspaces";

drop policy "Workspace members can update their workspaces" on "public"."workspaces";

revoke delete on table "public"."account_delete_tokens" from "anon";

revoke insert on table "public"."account_delete_tokens" from "anon";

revoke references on table "public"."account_delete_tokens" from "anon";

revoke select on table "public"."account_delete_tokens" from "anon";

revoke trigger on table "public"."account_delete_tokens" from "anon";

revoke truncate on table "public"."account_delete_tokens" from "anon";

revoke update on table "public"."account_delete_tokens" from "anon";

revoke delete on table "public"."account_delete_tokens" from "authenticated";

revoke insert on table "public"."account_delete_tokens" from "authenticated";

revoke references on table "public"."account_delete_tokens" from "authenticated";

revoke select on table "public"."account_delete_tokens" from "authenticated";

revoke trigger on table "public"."account_delete_tokens" from "authenticated";

revoke truncate on table "public"."account_delete_tokens" from "authenticated";

revoke update on table "public"."account_delete_tokens" from "authenticated";

revoke delete on table "public"."account_delete_tokens" from "service_role";

revoke insert on table "public"."account_delete_tokens" from "service_role";

revoke references on table "public"."account_delete_tokens" from "service_role";

revoke select on table "public"."account_delete_tokens" from "service_role";

revoke trigger on table "public"."account_delete_tokens" from "service_role";

revoke truncate on table "public"."account_delete_tokens" from "service_role";

revoke update on table "public"."account_delete_tokens" from "service_role";

revoke delete on table "public"."app_settings" from "anon";

revoke insert on table "public"."app_settings" from "anon";

revoke references on table "public"."app_settings" from "anon";

revoke select on table "public"."app_settings" from "anon";

revoke trigger on table "public"."app_settings" from "anon";

revoke truncate on table "public"."app_settings" from "anon";

revoke update on table "public"."app_settings" from "anon";

revoke delete on table "public"."app_settings" from "authenticated";

revoke insert on table "public"."app_settings" from "authenticated";

revoke references on table "public"."app_settings" from "authenticated";

revoke select on table "public"."app_settings" from "authenticated";

revoke trigger on table "public"."app_settings" from "authenticated";

revoke truncate on table "public"."app_settings" from "authenticated";

revoke update on table "public"."app_settings" from "authenticated";

revoke delete on table "public"."app_settings" from "service_role";

revoke insert on table "public"."app_settings" from "service_role";

revoke references on table "public"."app_settings" from "service_role";

revoke select on table "public"."app_settings" from "service_role";

revoke trigger on table "public"."app_settings" from "service_role";

revoke truncate on table "public"."app_settings" from "service_role";

revoke update on table "public"."app_settings" from "service_role";

revoke delete on table "public"."billing_customers" from "anon";

revoke insert on table "public"."billing_customers" from "anon";

revoke references on table "public"."billing_customers" from "anon";

revoke select on table "public"."billing_customers" from "anon";

revoke trigger on table "public"."billing_customers" from "anon";

revoke truncate on table "public"."billing_customers" from "anon";

revoke update on table "public"."billing_customers" from "anon";

revoke delete on table "public"."billing_customers" from "authenticated";

revoke insert on table "public"."billing_customers" from "authenticated";

revoke references on table "public"."billing_customers" from "authenticated";

revoke select on table "public"."billing_customers" from "authenticated";

revoke trigger on table "public"."billing_customers" from "authenticated";

revoke truncate on table "public"."billing_customers" from "authenticated";

revoke update on table "public"."billing_customers" from "authenticated";

revoke delete on table "public"."billing_customers" from "service_role";

revoke insert on table "public"."billing_customers" from "service_role";

revoke references on table "public"."billing_customers" from "service_role";

revoke select on table "public"."billing_customers" from "service_role";

revoke trigger on table "public"."billing_customers" from "service_role";

revoke truncate on table "public"."billing_customers" from "service_role";

revoke update on table "public"."billing_customers" from "service_role";

revoke delete on table "public"."billing_invoices" from "anon";

revoke insert on table "public"."billing_invoices" from "anon";

revoke references on table "public"."billing_invoices" from "anon";

revoke select on table "public"."billing_invoices" from "anon";

revoke trigger on table "public"."billing_invoices" from "anon";

revoke truncate on table "public"."billing_invoices" from "anon";

revoke update on table "public"."billing_invoices" from "anon";

revoke delete on table "public"."billing_invoices" from "authenticated";

revoke insert on table "public"."billing_invoices" from "authenticated";

revoke references on table "public"."billing_invoices" from "authenticated";

revoke select on table "public"."billing_invoices" from "authenticated";

revoke trigger on table "public"."billing_invoices" from "authenticated";

revoke truncate on table "public"."billing_invoices" from "authenticated";

revoke update on table "public"."billing_invoices" from "authenticated";

revoke delete on table "public"."billing_invoices" from "service_role";

revoke insert on table "public"."billing_invoices" from "service_role";

revoke references on table "public"."billing_invoices" from "service_role";

revoke select on table "public"."billing_invoices" from "service_role";

revoke trigger on table "public"."billing_invoices" from "service_role";

revoke truncate on table "public"."billing_invoices" from "service_role";

revoke update on table "public"."billing_invoices" from "service_role";

revoke delete on table "public"."billing_one_time_payments" from "anon";

revoke insert on table "public"."billing_one_time_payments" from "anon";

revoke references on table "public"."billing_one_time_payments" from "anon";

revoke select on table "public"."billing_one_time_payments" from "anon";

revoke trigger on table "public"."billing_one_time_payments" from "anon";

revoke truncate on table "public"."billing_one_time_payments" from "anon";

revoke update on table "public"."billing_one_time_payments" from "anon";

revoke delete on table "public"."billing_one_time_payments" from "authenticated";

revoke insert on table "public"."billing_one_time_payments" from "authenticated";

revoke references on table "public"."billing_one_time_payments" from "authenticated";

revoke select on table "public"."billing_one_time_payments" from "authenticated";

revoke trigger on table "public"."billing_one_time_payments" from "authenticated";

revoke truncate on table "public"."billing_one_time_payments" from "authenticated";

revoke update on table "public"."billing_one_time_payments" from "authenticated";

revoke delete on table "public"."billing_one_time_payments" from "service_role";

revoke insert on table "public"."billing_one_time_payments" from "service_role";

revoke references on table "public"."billing_one_time_payments" from "service_role";

revoke select on table "public"."billing_one_time_payments" from "service_role";

revoke trigger on table "public"."billing_one_time_payments" from "service_role";

revoke truncate on table "public"."billing_one_time_payments" from "service_role";

revoke update on table "public"."billing_one_time_payments" from "service_role";

revoke delete on table "public"."billing_payment_methods" from "anon";

revoke insert on table "public"."billing_payment_methods" from "anon";

revoke references on table "public"."billing_payment_methods" from "anon";

revoke select on table "public"."billing_payment_methods" from "anon";

revoke trigger on table "public"."billing_payment_methods" from "anon";

revoke truncate on table "public"."billing_payment_methods" from "anon";

revoke update on table "public"."billing_payment_methods" from "anon";

revoke delete on table "public"."billing_payment_methods" from "authenticated";

revoke insert on table "public"."billing_payment_methods" from "authenticated";

revoke references on table "public"."billing_payment_methods" from "authenticated";

revoke select on table "public"."billing_payment_methods" from "authenticated";

revoke trigger on table "public"."billing_payment_methods" from "authenticated";

revoke truncate on table "public"."billing_payment_methods" from "authenticated";

revoke update on table "public"."billing_payment_methods" from "authenticated";

revoke delete on table "public"."billing_payment_methods" from "service_role";

revoke insert on table "public"."billing_payment_methods" from "service_role";

revoke references on table "public"."billing_payment_methods" from "service_role";

revoke select on table "public"."billing_payment_methods" from "service_role";

revoke trigger on table "public"."billing_payment_methods" from "service_role";

revoke truncate on table "public"."billing_payment_methods" from "service_role";

revoke update on table "public"."billing_payment_methods" from "service_role";

revoke delete on table "public"."billing_prices" from "anon";

revoke insert on table "public"."billing_prices" from "anon";

revoke references on table "public"."billing_prices" from "anon";

revoke select on table "public"."billing_prices" from "anon";

revoke trigger on table "public"."billing_prices" from "anon";

revoke truncate on table "public"."billing_prices" from "anon";

revoke update on table "public"."billing_prices" from "anon";

revoke delete on table "public"."billing_prices" from "authenticated";

revoke insert on table "public"."billing_prices" from "authenticated";

revoke references on table "public"."billing_prices" from "authenticated";

revoke select on table "public"."billing_prices" from "authenticated";

revoke trigger on table "public"."billing_prices" from "authenticated";

revoke truncate on table "public"."billing_prices" from "authenticated";

revoke update on table "public"."billing_prices" from "authenticated";

revoke delete on table "public"."billing_prices" from "service_role";

revoke insert on table "public"."billing_prices" from "service_role";

revoke references on table "public"."billing_prices" from "service_role";

revoke select on table "public"."billing_prices" from "service_role";

revoke trigger on table "public"."billing_prices" from "service_role";

revoke truncate on table "public"."billing_prices" from "service_role";

revoke update on table "public"."billing_prices" from "service_role";

revoke delete on table "public"."billing_products" from "anon";

revoke insert on table "public"."billing_products" from "anon";

revoke references on table "public"."billing_products" from "anon";

revoke select on table "public"."billing_products" from "anon";

revoke trigger on table "public"."billing_products" from "anon";

revoke truncate on table "public"."billing_products" from "anon";

revoke update on table "public"."billing_products" from "anon";

revoke delete on table "public"."billing_products" from "authenticated";

revoke insert on table "public"."billing_products" from "authenticated";

revoke references on table "public"."billing_products" from "authenticated";

revoke select on table "public"."billing_products" from "authenticated";

revoke trigger on table "public"."billing_products" from "authenticated";

revoke truncate on table "public"."billing_products" from "authenticated";

revoke update on table "public"."billing_products" from "authenticated";

revoke delete on table "public"."billing_products" from "service_role";

revoke insert on table "public"."billing_products" from "service_role";

revoke references on table "public"."billing_products" from "service_role";

revoke select on table "public"."billing_products" from "service_role";

revoke trigger on table "public"."billing_products" from "service_role";

revoke truncate on table "public"."billing_products" from "service_role";

revoke update on table "public"."billing_products" from "service_role";

revoke delete on table "public"."billing_subscriptions" from "anon";

revoke insert on table "public"."billing_subscriptions" from "anon";

revoke references on table "public"."billing_subscriptions" from "anon";

revoke select on table "public"."billing_subscriptions" from "anon";

revoke trigger on table "public"."billing_subscriptions" from "anon";

revoke truncate on table "public"."billing_subscriptions" from "anon";

revoke update on table "public"."billing_subscriptions" from "anon";

revoke delete on table "public"."billing_subscriptions" from "authenticated";

revoke insert on table "public"."billing_subscriptions" from "authenticated";

revoke references on table "public"."billing_subscriptions" from "authenticated";

revoke select on table "public"."billing_subscriptions" from "authenticated";

revoke trigger on table "public"."billing_subscriptions" from "authenticated";

revoke truncate on table "public"."billing_subscriptions" from "authenticated";

revoke update on table "public"."billing_subscriptions" from "authenticated";

revoke delete on table "public"."billing_subscriptions" from "service_role";

revoke insert on table "public"."billing_subscriptions" from "service_role";

revoke references on table "public"."billing_subscriptions" from "service_role";

revoke select on table "public"."billing_subscriptions" from "service_role";

revoke trigger on table "public"."billing_subscriptions" from "service_role";

revoke truncate on table "public"."billing_subscriptions" from "service_role";

revoke update on table "public"."billing_subscriptions" from "service_role";

revoke delete on table "public"."billing_usage_logs" from "anon";

revoke insert on table "public"."billing_usage_logs" from "anon";

revoke references on table "public"."billing_usage_logs" from "anon";

revoke select on table "public"."billing_usage_logs" from "anon";

revoke trigger on table "public"."billing_usage_logs" from "anon";

revoke truncate on table "public"."billing_usage_logs" from "anon";

revoke update on table "public"."billing_usage_logs" from "anon";

revoke delete on table "public"."billing_usage_logs" from "authenticated";

revoke insert on table "public"."billing_usage_logs" from "authenticated";

revoke references on table "public"."billing_usage_logs" from "authenticated";

revoke select on table "public"."billing_usage_logs" from "authenticated";

revoke trigger on table "public"."billing_usage_logs" from "authenticated";

revoke truncate on table "public"."billing_usage_logs" from "authenticated";

revoke update on table "public"."billing_usage_logs" from "authenticated";

revoke delete on table "public"."billing_usage_logs" from "service_role";

revoke insert on table "public"."billing_usage_logs" from "service_role";

revoke references on table "public"."billing_usage_logs" from "service_role";

revoke select on table "public"."billing_usage_logs" from "service_role";

revoke trigger on table "public"."billing_usage_logs" from "service_role";

revoke truncate on table "public"."billing_usage_logs" from "service_role";

revoke update on table "public"."billing_usage_logs" from "service_role";

revoke delete on table "public"."billing_volume_tiers" from "anon";

revoke insert on table "public"."billing_volume_tiers" from "anon";

revoke references on table "public"."billing_volume_tiers" from "anon";

revoke select on table "public"."billing_volume_tiers" from "anon";

revoke trigger on table "public"."billing_volume_tiers" from "anon";

revoke truncate on table "public"."billing_volume_tiers" from "anon";

revoke update on table "public"."billing_volume_tiers" from "anon";

revoke delete on table "public"."billing_volume_tiers" from "authenticated";

revoke insert on table "public"."billing_volume_tiers" from "authenticated";

revoke references on table "public"."billing_volume_tiers" from "authenticated";

revoke select on table "public"."billing_volume_tiers" from "authenticated";

revoke trigger on table "public"."billing_volume_tiers" from "authenticated";

revoke truncate on table "public"."billing_volume_tiers" from "authenticated";

revoke update on table "public"."billing_volume_tiers" from "authenticated";

revoke delete on table "public"."billing_volume_tiers" from "service_role";

revoke insert on table "public"."billing_volume_tiers" from "service_role";

revoke references on table "public"."billing_volume_tiers" from "service_role";

revoke select on table "public"."billing_volume_tiers" from "service_role";

revoke trigger on table "public"."billing_volume_tiers" from "service_role";

revoke truncate on table "public"."billing_volume_tiers" from "service_role";

revoke update on table "public"."billing_volume_tiers" from "service_role";

revoke delete on table "public"."chats" from "anon";

revoke insert on table "public"."chats" from "anon";

revoke references on table "public"."chats" from "anon";

revoke select on table "public"."chats" from "anon";

revoke trigger on table "public"."chats" from "anon";

revoke truncate on table "public"."chats" from "anon";

revoke update on table "public"."chats" from "anon";

revoke delete on table "public"."chats" from "authenticated";

revoke insert on table "public"."chats" from "authenticated";

revoke references on table "public"."chats" from "authenticated";

revoke select on table "public"."chats" from "authenticated";

revoke trigger on table "public"."chats" from "authenticated";

revoke truncate on table "public"."chats" from "authenticated";

revoke update on table "public"."chats" from "authenticated";

revoke delete on table "public"."chats" from "service_role";

revoke insert on table "public"."chats" from "service_role";

revoke references on table "public"."chats" from "service_role";

revoke select on table "public"."chats" from "service_role";

revoke trigger on table "public"."chats" from "service_role";

revoke truncate on table "public"."chats" from "service_role";

revoke update on table "public"."chats" from "service_role";

revoke delete on table "public"."files" from "anon";

revoke insert on table "public"."files" from "anon";

revoke references on table "public"."files" from "anon";

revoke select on table "public"."files" from "anon";

revoke trigger on table "public"."files" from "anon";

revoke truncate on table "public"."files" from "anon";

revoke update on table "public"."files" from "anon";

revoke delete on table "public"."files" from "authenticated";

revoke insert on table "public"."files" from "authenticated";

revoke references on table "public"."files" from "authenticated";

revoke select on table "public"."files" from "authenticated";

revoke trigger on table "public"."files" from "authenticated";

revoke truncate on table "public"."files" from "authenticated";

revoke update on table "public"."files" from "authenticated";

revoke delete on table "public"."files" from "service_role";

revoke insert on table "public"."files" from "service_role";

revoke references on table "public"."files" from "service_role";

revoke select on table "public"."files" from "service_role";

revoke trigger on table "public"."files" from "service_role";

revoke truncate on table "public"."files" from "service_role";

revoke update on table "public"."files" from "service_role";

revoke delete on table "public"."jobs" from "anon";

revoke insert on table "public"."jobs" from "anon";

revoke references on table "public"."jobs" from "anon";

revoke select on table "public"."jobs" from "anon";

revoke trigger on table "public"."jobs" from "anon";

revoke truncate on table "public"."jobs" from "anon";

revoke update on table "public"."jobs" from "anon";

revoke delete on table "public"."jobs" from "authenticated";

revoke insert on table "public"."jobs" from "authenticated";

revoke references on table "public"."jobs" from "authenticated";

revoke select on table "public"."jobs" from "authenticated";

revoke trigger on table "public"."jobs" from "authenticated";

revoke truncate on table "public"."jobs" from "authenticated";

revoke update on table "public"."jobs" from "authenticated";

revoke delete on table "public"."jobs" from "service_role";

revoke insert on table "public"."jobs" from "service_role";

revoke references on table "public"."jobs" from "service_role";

revoke select on table "public"."jobs" from "service_role";

revoke trigger on table "public"."jobs" from "service_role";

revoke truncate on table "public"."jobs" from "service_role";

revoke update on table "public"."jobs" from "service_role";

revoke delete on table "public"."marketing_author_profiles" from "anon";

revoke insert on table "public"."marketing_author_profiles" from "anon";

revoke references on table "public"."marketing_author_profiles" from "anon";

revoke select on table "public"."marketing_author_profiles" from "anon";

revoke trigger on table "public"."marketing_author_profiles" from "anon";

revoke truncate on table "public"."marketing_author_profiles" from "anon";

revoke update on table "public"."marketing_author_profiles" from "anon";

revoke delete on table "public"."marketing_author_profiles" from "authenticated";

revoke insert on table "public"."marketing_author_profiles" from "authenticated";

revoke references on table "public"."marketing_author_profiles" from "authenticated";

revoke select on table "public"."marketing_author_profiles" from "authenticated";

revoke trigger on table "public"."marketing_author_profiles" from "authenticated";

revoke truncate on table "public"."marketing_author_profiles" from "authenticated";

revoke update on table "public"."marketing_author_profiles" from "authenticated";

revoke delete on table "public"."marketing_author_profiles" from "service_role";

revoke insert on table "public"."marketing_author_profiles" from "service_role";

revoke references on table "public"."marketing_author_profiles" from "service_role";

revoke select on table "public"."marketing_author_profiles" from "service_role";

revoke trigger on table "public"."marketing_author_profiles" from "service_role";

revoke truncate on table "public"."marketing_author_profiles" from "service_role";

revoke update on table "public"."marketing_author_profiles" from "service_role";

revoke delete on table "public"."marketing_blog_author_posts" from "anon";

revoke insert on table "public"."marketing_blog_author_posts" from "anon";

revoke references on table "public"."marketing_blog_author_posts" from "anon";

revoke select on table "public"."marketing_blog_author_posts" from "anon";

revoke trigger on table "public"."marketing_blog_author_posts" from "anon";

revoke truncate on table "public"."marketing_blog_author_posts" from "anon";

revoke update on table "public"."marketing_blog_author_posts" from "anon";

revoke delete on table "public"."marketing_blog_author_posts" from "authenticated";

revoke insert on table "public"."marketing_blog_author_posts" from "authenticated";

revoke references on table "public"."marketing_blog_author_posts" from "authenticated";

revoke select on table "public"."marketing_blog_author_posts" from "authenticated";

revoke trigger on table "public"."marketing_blog_author_posts" from "authenticated";

revoke truncate on table "public"."marketing_blog_author_posts" from "authenticated";

revoke update on table "public"."marketing_blog_author_posts" from "authenticated";

revoke delete on table "public"."marketing_blog_author_posts" from "service_role";

revoke insert on table "public"."marketing_blog_author_posts" from "service_role";

revoke references on table "public"."marketing_blog_author_posts" from "service_role";

revoke select on table "public"."marketing_blog_author_posts" from "service_role";

revoke trigger on table "public"."marketing_blog_author_posts" from "service_role";

revoke truncate on table "public"."marketing_blog_author_posts" from "service_role";

revoke update on table "public"."marketing_blog_author_posts" from "service_role";

revoke delete on table "public"."marketing_blog_post_tags_relationship" from "anon";

revoke insert on table "public"."marketing_blog_post_tags_relationship" from "anon";

revoke references on table "public"."marketing_blog_post_tags_relationship" from "anon";

revoke select on table "public"."marketing_blog_post_tags_relationship" from "anon";

revoke trigger on table "public"."marketing_blog_post_tags_relationship" from "anon";

revoke truncate on table "public"."marketing_blog_post_tags_relationship" from "anon";

revoke update on table "public"."marketing_blog_post_tags_relationship" from "anon";

revoke delete on table "public"."marketing_blog_post_tags_relationship" from "authenticated";

revoke insert on table "public"."marketing_blog_post_tags_relationship" from "authenticated";

revoke references on table "public"."marketing_blog_post_tags_relationship" from "authenticated";

revoke select on table "public"."marketing_blog_post_tags_relationship" from "authenticated";

revoke trigger on table "public"."marketing_blog_post_tags_relationship" from "authenticated";

revoke truncate on table "public"."marketing_blog_post_tags_relationship" from "authenticated";

revoke update on table "public"."marketing_blog_post_tags_relationship" from "authenticated";

revoke delete on table "public"."marketing_blog_post_tags_relationship" from "service_role";

revoke insert on table "public"."marketing_blog_post_tags_relationship" from "service_role";

revoke references on table "public"."marketing_blog_post_tags_relationship" from "service_role";

revoke select on table "public"."marketing_blog_post_tags_relationship" from "service_role";

revoke trigger on table "public"."marketing_blog_post_tags_relationship" from "service_role";

revoke truncate on table "public"."marketing_blog_post_tags_relationship" from "service_role";

revoke update on table "public"."marketing_blog_post_tags_relationship" from "service_role";

revoke delete on table "public"."marketing_blog_posts" from "anon";

revoke insert on table "public"."marketing_blog_posts" from "anon";

revoke references on table "public"."marketing_blog_posts" from "anon";

revoke select on table "public"."marketing_blog_posts" from "anon";

revoke trigger on table "public"."marketing_blog_posts" from "anon";

revoke truncate on table "public"."marketing_blog_posts" from "anon";

revoke update on table "public"."marketing_blog_posts" from "anon";

revoke delete on table "public"."marketing_blog_posts" from "authenticated";

revoke insert on table "public"."marketing_blog_posts" from "authenticated";

revoke references on table "public"."marketing_blog_posts" from "authenticated";

revoke select on table "public"."marketing_blog_posts" from "authenticated";

revoke trigger on table "public"."marketing_blog_posts" from "authenticated";

revoke truncate on table "public"."marketing_blog_posts" from "authenticated";

revoke update on table "public"."marketing_blog_posts" from "authenticated";

revoke delete on table "public"."marketing_blog_posts" from "service_role";

revoke insert on table "public"."marketing_blog_posts" from "service_role";

revoke references on table "public"."marketing_blog_posts" from "service_role";

revoke select on table "public"."marketing_blog_posts" from "service_role";

revoke trigger on table "public"."marketing_blog_posts" from "service_role";

revoke truncate on table "public"."marketing_blog_posts" from "service_role";

revoke update on table "public"."marketing_blog_posts" from "service_role";

revoke delete on table "public"."marketing_changelog" from "anon";

revoke insert on table "public"."marketing_changelog" from "anon";

revoke references on table "public"."marketing_changelog" from "anon";

revoke select on table "public"."marketing_changelog" from "anon";

revoke trigger on table "public"."marketing_changelog" from "anon";

revoke truncate on table "public"."marketing_changelog" from "anon";

revoke update on table "public"."marketing_changelog" from "anon";

revoke delete on table "public"."marketing_changelog" from "authenticated";

revoke insert on table "public"."marketing_changelog" from "authenticated";

revoke references on table "public"."marketing_changelog" from "authenticated";

revoke select on table "public"."marketing_changelog" from "authenticated";

revoke trigger on table "public"."marketing_changelog" from "authenticated";

revoke truncate on table "public"."marketing_changelog" from "authenticated";

revoke update on table "public"."marketing_changelog" from "authenticated";

revoke delete on table "public"."marketing_changelog" from "service_role";

revoke insert on table "public"."marketing_changelog" from "service_role";

revoke references on table "public"."marketing_changelog" from "service_role";

revoke select on table "public"."marketing_changelog" from "service_role";

revoke trigger on table "public"."marketing_changelog" from "service_role";

revoke truncate on table "public"."marketing_changelog" from "service_role";

revoke update on table "public"."marketing_changelog" from "service_role";

revoke delete on table "public"."marketing_changelog_author_relationship" from "anon";

revoke insert on table "public"."marketing_changelog_author_relationship" from "anon";

revoke references on table "public"."marketing_changelog_author_relationship" from "anon";

revoke select on table "public"."marketing_changelog_author_relationship" from "anon";

revoke trigger on table "public"."marketing_changelog_author_relationship" from "anon";

revoke truncate on table "public"."marketing_changelog_author_relationship" from "anon";

revoke update on table "public"."marketing_changelog_author_relationship" from "anon";

revoke delete on table "public"."marketing_changelog_author_relationship" from "authenticated";

revoke insert on table "public"."marketing_changelog_author_relationship" from "authenticated";

revoke references on table "public"."marketing_changelog_author_relationship" from "authenticated";

revoke select on table "public"."marketing_changelog_author_relationship" from "authenticated";

revoke trigger on table "public"."marketing_changelog_author_relationship" from "authenticated";

revoke truncate on table "public"."marketing_changelog_author_relationship" from "authenticated";

revoke update on table "public"."marketing_changelog_author_relationship" from "authenticated";

revoke delete on table "public"."marketing_changelog_author_relationship" from "service_role";

revoke insert on table "public"."marketing_changelog_author_relationship" from "service_role";

revoke references on table "public"."marketing_changelog_author_relationship" from "service_role";

revoke select on table "public"."marketing_changelog_author_relationship" from "service_role";

revoke trigger on table "public"."marketing_changelog_author_relationship" from "service_role";

revoke truncate on table "public"."marketing_changelog_author_relationship" from "service_role";

revoke update on table "public"."marketing_changelog_author_relationship" from "service_role";

revoke delete on table "public"."marketing_feedback_board_subscriptions" from "anon";

revoke insert on table "public"."marketing_feedback_board_subscriptions" from "anon";

revoke references on table "public"."marketing_feedback_board_subscriptions" from "anon";

revoke select on table "public"."marketing_feedback_board_subscriptions" from "anon";

revoke trigger on table "public"."marketing_feedback_board_subscriptions" from "anon";

revoke truncate on table "public"."marketing_feedback_board_subscriptions" from "anon";

revoke update on table "public"."marketing_feedback_board_subscriptions" from "anon";

revoke delete on table "public"."marketing_feedback_board_subscriptions" from "authenticated";

revoke insert on table "public"."marketing_feedback_board_subscriptions" from "authenticated";

revoke references on table "public"."marketing_feedback_board_subscriptions" from "authenticated";

revoke select on table "public"."marketing_feedback_board_subscriptions" from "authenticated";

revoke trigger on table "public"."marketing_feedback_board_subscriptions" from "authenticated";

revoke truncate on table "public"."marketing_feedback_board_subscriptions" from "authenticated";

revoke update on table "public"."marketing_feedback_board_subscriptions" from "authenticated";

revoke delete on table "public"."marketing_feedback_board_subscriptions" from "service_role";

revoke insert on table "public"."marketing_feedback_board_subscriptions" from "service_role";

revoke references on table "public"."marketing_feedback_board_subscriptions" from "service_role";

revoke select on table "public"."marketing_feedback_board_subscriptions" from "service_role";

revoke trigger on table "public"."marketing_feedback_board_subscriptions" from "service_role";

revoke truncate on table "public"."marketing_feedback_board_subscriptions" from "service_role";

revoke update on table "public"."marketing_feedback_board_subscriptions" from "service_role";

revoke delete on table "public"."marketing_feedback_boards" from "anon";

revoke insert on table "public"."marketing_feedback_boards" from "anon";

revoke references on table "public"."marketing_feedback_boards" from "anon";

revoke select on table "public"."marketing_feedback_boards" from "anon";

revoke trigger on table "public"."marketing_feedback_boards" from "anon";

revoke truncate on table "public"."marketing_feedback_boards" from "anon";

revoke update on table "public"."marketing_feedback_boards" from "anon";

revoke delete on table "public"."marketing_feedback_boards" from "authenticated";

revoke insert on table "public"."marketing_feedback_boards" from "authenticated";

revoke references on table "public"."marketing_feedback_boards" from "authenticated";

revoke select on table "public"."marketing_feedback_boards" from "authenticated";

revoke trigger on table "public"."marketing_feedback_boards" from "authenticated";

revoke truncate on table "public"."marketing_feedback_boards" from "authenticated";

revoke update on table "public"."marketing_feedback_boards" from "authenticated";

revoke delete on table "public"."marketing_feedback_boards" from "service_role";

revoke insert on table "public"."marketing_feedback_boards" from "service_role";

revoke references on table "public"."marketing_feedback_boards" from "service_role";

revoke select on table "public"."marketing_feedback_boards" from "service_role";

revoke trigger on table "public"."marketing_feedback_boards" from "service_role";

revoke truncate on table "public"."marketing_feedback_boards" from "service_role";

revoke update on table "public"."marketing_feedback_boards" from "service_role";

revoke delete on table "public"."marketing_feedback_comment_reactions" from "anon";

revoke insert on table "public"."marketing_feedback_comment_reactions" from "anon";

revoke references on table "public"."marketing_feedback_comment_reactions" from "anon";

revoke select on table "public"."marketing_feedback_comment_reactions" from "anon";

revoke trigger on table "public"."marketing_feedback_comment_reactions" from "anon";

revoke truncate on table "public"."marketing_feedback_comment_reactions" from "anon";

revoke update on table "public"."marketing_feedback_comment_reactions" from "anon";

revoke delete on table "public"."marketing_feedback_comment_reactions" from "authenticated";

revoke insert on table "public"."marketing_feedback_comment_reactions" from "authenticated";

revoke references on table "public"."marketing_feedback_comment_reactions" from "authenticated";

revoke select on table "public"."marketing_feedback_comment_reactions" from "authenticated";

revoke trigger on table "public"."marketing_feedback_comment_reactions" from "authenticated";

revoke truncate on table "public"."marketing_feedback_comment_reactions" from "authenticated";

revoke update on table "public"."marketing_feedback_comment_reactions" from "authenticated";

revoke delete on table "public"."marketing_feedback_comment_reactions" from "service_role";

revoke insert on table "public"."marketing_feedback_comment_reactions" from "service_role";

revoke references on table "public"."marketing_feedback_comment_reactions" from "service_role";

revoke select on table "public"."marketing_feedback_comment_reactions" from "service_role";

revoke trigger on table "public"."marketing_feedback_comment_reactions" from "service_role";

revoke truncate on table "public"."marketing_feedback_comment_reactions" from "service_role";

revoke update on table "public"."marketing_feedback_comment_reactions" from "service_role";

revoke delete on table "public"."marketing_feedback_comments" from "anon";

revoke insert on table "public"."marketing_feedback_comments" from "anon";

revoke references on table "public"."marketing_feedback_comments" from "anon";

revoke select on table "public"."marketing_feedback_comments" from "anon";

revoke trigger on table "public"."marketing_feedback_comments" from "anon";

revoke truncate on table "public"."marketing_feedback_comments" from "anon";

revoke update on table "public"."marketing_feedback_comments" from "anon";

revoke delete on table "public"."marketing_feedback_comments" from "authenticated";

revoke insert on table "public"."marketing_feedback_comments" from "authenticated";

revoke references on table "public"."marketing_feedback_comments" from "authenticated";

revoke select on table "public"."marketing_feedback_comments" from "authenticated";

revoke trigger on table "public"."marketing_feedback_comments" from "authenticated";

revoke truncate on table "public"."marketing_feedback_comments" from "authenticated";

revoke update on table "public"."marketing_feedback_comments" from "authenticated";

revoke delete on table "public"."marketing_feedback_comments" from "service_role";

revoke insert on table "public"."marketing_feedback_comments" from "service_role";

revoke references on table "public"."marketing_feedback_comments" from "service_role";

revoke select on table "public"."marketing_feedback_comments" from "service_role";

revoke trigger on table "public"."marketing_feedback_comments" from "service_role";

revoke truncate on table "public"."marketing_feedback_comments" from "service_role";

revoke update on table "public"."marketing_feedback_comments" from "service_role";

revoke delete on table "public"."marketing_feedback_thread_reactions" from "anon";

revoke insert on table "public"."marketing_feedback_thread_reactions" from "anon";

revoke references on table "public"."marketing_feedback_thread_reactions" from "anon";

revoke select on table "public"."marketing_feedback_thread_reactions" from "anon";

revoke trigger on table "public"."marketing_feedback_thread_reactions" from "anon";

revoke truncate on table "public"."marketing_feedback_thread_reactions" from "anon";

revoke update on table "public"."marketing_feedback_thread_reactions" from "anon";

revoke delete on table "public"."marketing_feedback_thread_reactions" from "authenticated";

revoke insert on table "public"."marketing_feedback_thread_reactions" from "authenticated";

revoke references on table "public"."marketing_feedback_thread_reactions" from "authenticated";

revoke select on table "public"."marketing_feedback_thread_reactions" from "authenticated";

revoke trigger on table "public"."marketing_feedback_thread_reactions" from "authenticated";

revoke truncate on table "public"."marketing_feedback_thread_reactions" from "authenticated";

revoke update on table "public"."marketing_feedback_thread_reactions" from "authenticated";

revoke delete on table "public"."marketing_feedback_thread_reactions" from "service_role";

revoke insert on table "public"."marketing_feedback_thread_reactions" from "service_role";

revoke references on table "public"."marketing_feedback_thread_reactions" from "service_role";

revoke select on table "public"."marketing_feedback_thread_reactions" from "service_role";

revoke trigger on table "public"."marketing_feedback_thread_reactions" from "service_role";

revoke truncate on table "public"."marketing_feedback_thread_reactions" from "service_role";

revoke update on table "public"."marketing_feedback_thread_reactions" from "service_role";

revoke delete on table "public"."marketing_feedback_thread_subscriptions" from "anon";

revoke insert on table "public"."marketing_feedback_thread_subscriptions" from "anon";

revoke references on table "public"."marketing_feedback_thread_subscriptions" from "anon";

revoke select on table "public"."marketing_feedback_thread_subscriptions" from "anon";

revoke trigger on table "public"."marketing_feedback_thread_subscriptions" from "anon";

revoke truncate on table "public"."marketing_feedback_thread_subscriptions" from "anon";

revoke update on table "public"."marketing_feedback_thread_subscriptions" from "anon";

revoke delete on table "public"."marketing_feedback_thread_subscriptions" from "authenticated";

revoke insert on table "public"."marketing_feedback_thread_subscriptions" from "authenticated";

revoke references on table "public"."marketing_feedback_thread_subscriptions" from "authenticated";

revoke select on table "public"."marketing_feedback_thread_subscriptions" from "authenticated";

revoke trigger on table "public"."marketing_feedback_thread_subscriptions" from "authenticated";

revoke truncate on table "public"."marketing_feedback_thread_subscriptions" from "authenticated";

revoke update on table "public"."marketing_feedback_thread_subscriptions" from "authenticated";

revoke delete on table "public"."marketing_feedback_thread_subscriptions" from "service_role";

revoke insert on table "public"."marketing_feedback_thread_subscriptions" from "service_role";

revoke references on table "public"."marketing_feedback_thread_subscriptions" from "service_role";

revoke select on table "public"."marketing_feedback_thread_subscriptions" from "service_role";

revoke trigger on table "public"."marketing_feedback_thread_subscriptions" from "service_role";

revoke truncate on table "public"."marketing_feedback_thread_subscriptions" from "service_role";

revoke update on table "public"."marketing_feedback_thread_subscriptions" from "service_role";

revoke delete on table "public"."marketing_feedback_threads" from "anon";

revoke insert on table "public"."marketing_feedback_threads" from "anon";

revoke references on table "public"."marketing_feedback_threads" from "anon";

revoke select on table "public"."marketing_feedback_threads" from "anon";

revoke trigger on table "public"."marketing_feedback_threads" from "anon";

revoke truncate on table "public"."marketing_feedback_threads" from "anon";

revoke update on table "public"."marketing_feedback_threads" from "anon";

revoke delete on table "public"."marketing_feedback_threads" from "authenticated";

revoke insert on table "public"."marketing_feedback_threads" from "authenticated";

revoke references on table "public"."marketing_feedback_threads" from "authenticated";

revoke select on table "public"."marketing_feedback_threads" from "authenticated";

revoke trigger on table "public"."marketing_feedback_threads" from "authenticated";

revoke truncate on table "public"."marketing_feedback_threads" from "authenticated";

revoke update on table "public"."marketing_feedback_threads" from "authenticated";

revoke delete on table "public"."marketing_feedback_threads" from "service_role";

revoke insert on table "public"."marketing_feedback_threads" from "service_role";

revoke references on table "public"."marketing_feedback_threads" from "service_role";

revoke select on table "public"."marketing_feedback_threads" from "service_role";

revoke trigger on table "public"."marketing_feedback_threads" from "service_role";

revoke truncate on table "public"."marketing_feedback_threads" from "service_role";

revoke update on table "public"."marketing_feedback_threads" from "service_role";

revoke delete on table "public"."marketing_tags" from "anon";

revoke insert on table "public"."marketing_tags" from "anon";

revoke references on table "public"."marketing_tags" from "anon";

revoke select on table "public"."marketing_tags" from "anon";

revoke trigger on table "public"."marketing_tags" from "anon";

revoke truncate on table "public"."marketing_tags" from "anon";

revoke update on table "public"."marketing_tags" from "anon";

revoke delete on table "public"."marketing_tags" from "authenticated";

revoke insert on table "public"."marketing_tags" from "authenticated";

revoke references on table "public"."marketing_tags" from "authenticated";

revoke select on table "public"."marketing_tags" from "authenticated";

revoke trigger on table "public"."marketing_tags" from "authenticated";

revoke truncate on table "public"."marketing_tags" from "authenticated";

revoke update on table "public"."marketing_tags" from "authenticated";

revoke delete on table "public"."marketing_tags" from "service_role";

revoke insert on table "public"."marketing_tags" from "service_role";

revoke references on table "public"."marketing_tags" from "service_role";

revoke select on table "public"."marketing_tags" from "service_role";

revoke trigger on table "public"."marketing_tags" from "service_role";

revoke truncate on table "public"."marketing_tags" from "service_role";

revoke update on table "public"."marketing_tags" from "service_role";

revoke delete on table "public"."project_comments" from "anon";

revoke insert on table "public"."project_comments" from "anon";

revoke references on table "public"."project_comments" from "anon";

revoke select on table "public"."project_comments" from "anon";

revoke trigger on table "public"."project_comments" from "anon";

revoke truncate on table "public"."project_comments" from "anon";

revoke update on table "public"."project_comments" from "anon";

revoke delete on table "public"."project_comments" from "authenticated";

revoke insert on table "public"."project_comments" from "authenticated";

revoke references on table "public"."project_comments" from "authenticated";

revoke select on table "public"."project_comments" from "authenticated";

revoke trigger on table "public"."project_comments" from "authenticated";

revoke truncate on table "public"."project_comments" from "authenticated";

revoke update on table "public"."project_comments" from "authenticated";

revoke delete on table "public"."project_comments" from "service_role";

revoke insert on table "public"."project_comments" from "service_role";

revoke references on table "public"."project_comments" from "service_role";

revoke select on table "public"."project_comments" from "service_role";

revoke trigger on table "public"."project_comments" from "service_role";

revoke truncate on table "public"."project_comments" from "service_role";

revoke update on table "public"."project_comments" from "service_role";

revoke delete on table "public"."projects" from "anon";

revoke insert on table "public"."projects" from "anon";

revoke references on table "public"."projects" from "anon";

revoke select on table "public"."projects" from "anon";

revoke trigger on table "public"."projects" from "anon";

revoke truncate on table "public"."projects" from "anon";

revoke update on table "public"."projects" from "anon";

revoke delete on table "public"."projects" from "authenticated";

revoke insert on table "public"."projects" from "authenticated";

revoke references on table "public"."projects" from "authenticated";

revoke select on table "public"."projects" from "authenticated";

revoke trigger on table "public"."projects" from "authenticated";

revoke truncate on table "public"."projects" from "authenticated";

revoke update on table "public"."projects" from "authenticated";

revoke delete on table "public"."projects" from "service_role";

revoke insert on table "public"."projects" from "service_role";

revoke references on table "public"."projects" from "service_role";

revoke select on table "public"."projects" from "service_role";

revoke trigger on table "public"."projects" from "service_role";

revoke truncate on table "public"."projects" from "service_role";

revoke update on table "public"."projects" from "service_role";

revoke delete on table "public"."stripe_webhook_events" from "anon";

revoke insert on table "public"."stripe_webhook_events" from "anon";

revoke references on table "public"."stripe_webhook_events" from "anon";

revoke select on table "public"."stripe_webhook_events" from "anon";

revoke trigger on table "public"."stripe_webhook_events" from "anon";

revoke truncate on table "public"."stripe_webhook_events" from "anon";

revoke update on table "public"."stripe_webhook_events" from "anon";

revoke delete on table "public"."stripe_webhook_events" from "authenticated";

revoke insert on table "public"."stripe_webhook_events" from "authenticated";

revoke references on table "public"."stripe_webhook_events" from "authenticated";

revoke select on table "public"."stripe_webhook_events" from "authenticated";

revoke trigger on table "public"."stripe_webhook_events" from "authenticated";

revoke truncate on table "public"."stripe_webhook_events" from "authenticated";

revoke update on table "public"."stripe_webhook_events" from "authenticated";

revoke delete on table "public"."stripe_webhook_events" from "service_role";

revoke insert on table "public"."stripe_webhook_events" from "service_role";

revoke references on table "public"."stripe_webhook_events" from "service_role";

revoke select on table "public"."stripe_webhook_events" from "service_role";

revoke trigger on table "public"."stripe_webhook_events" from "service_role";

revoke truncate on table "public"."stripe_webhook_events" from "service_role";

revoke update on table "public"."stripe_webhook_events" from "service_role";

revoke delete on table "public"."user_api_keys" from "anon";

revoke insert on table "public"."user_api_keys" from "anon";

revoke references on table "public"."user_api_keys" from "anon";

revoke select on table "public"."user_api_keys" from "anon";

revoke trigger on table "public"."user_api_keys" from "anon";

revoke truncate on table "public"."user_api_keys" from "anon";

revoke update on table "public"."user_api_keys" from "anon";

revoke delete on table "public"."user_api_keys" from "authenticated";

revoke insert on table "public"."user_api_keys" from "authenticated";

revoke references on table "public"."user_api_keys" from "authenticated";

revoke select on table "public"."user_api_keys" from "authenticated";

revoke trigger on table "public"."user_api_keys" from "authenticated";

revoke truncate on table "public"."user_api_keys" from "authenticated";

revoke update on table "public"."user_api_keys" from "authenticated";

revoke delete on table "public"."user_api_keys" from "service_role";

revoke insert on table "public"."user_api_keys" from "service_role";

revoke references on table "public"."user_api_keys" from "service_role";

revoke select on table "public"."user_api_keys" from "service_role";

revoke trigger on table "public"."user_api_keys" from "service_role";

revoke truncate on table "public"."user_api_keys" from "service_role";

revoke update on table "public"."user_api_keys" from "service_role";

revoke delete on table "public"."user_application_settings" from "anon";

revoke insert on table "public"."user_application_settings" from "anon";

revoke references on table "public"."user_application_settings" from "anon";

revoke select on table "public"."user_application_settings" from "anon";

revoke trigger on table "public"."user_application_settings" from "anon";

revoke truncate on table "public"."user_application_settings" from "anon";

revoke update on table "public"."user_application_settings" from "anon";

revoke delete on table "public"."user_application_settings" from "authenticated";

revoke insert on table "public"."user_application_settings" from "authenticated";

revoke references on table "public"."user_application_settings" from "authenticated";

revoke select on table "public"."user_application_settings" from "authenticated";

revoke trigger on table "public"."user_application_settings" from "authenticated";

revoke truncate on table "public"."user_application_settings" from "authenticated";

revoke update on table "public"."user_application_settings" from "authenticated";

revoke delete on table "public"."user_application_settings" from "service_role";

revoke insert on table "public"."user_application_settings" from "service_role";

revoke references on table "public"."user_application_settings" from "service_role";

revoke select on table "public"."user_application_settings" from "service_role";

revoke trigger on table "public"."user_application_settings" from "service_role";

revoke truncate on table "public"."user_application_settings" from "service_role";

revoke update on table "public"."user_application_settings" from "service_role";

revoke delete on table "public"."user_notifications" from "anon";

revoke insert on table "public"."user_notifications" from "anon";

revoke references on table "public"."user_notifications" from "anon";

revoke select on table "public"."user_notifications" from "anon";

revoke trigger on table "public"."user_notifications" from "anon";

revoke truncate on table "public"."user_notifications" from "anon";

revoke update on table "public"."user_notifications" from "anon";

revoke delete on table "public"."user_notifications" from "authenticated";

revoke insert on table "public"."user_notifications" from "authenticated";

revoke references on table "public"."user_notifications" from "authenticated";

revoke select on table "public"."user_notifications" from "authenticated";

revoke trigger on table "public"."user_notifications" from "authenticated";

revoke truncate on table "public"."user_notifications" from "authenticated";

revoke update on table "public"."user_notifications" from "authenticated";

revoke delete on table "public"."user_notifications" from "service_role";

revoke insert on table "public"."user_notifications" from "service_role";

revoke references on table "public"."user_notifications" from "service_role";

revoke select on table "public"."user_notifications" from "service_role";

revoke trigger on table "public"."user_notifications" from "service_role";

revoke truncate on table "public"."user_notifications" from "service_role";

revoke update on table "public"."user_notifications" from "service_role";

revoke delete on table "public"."user_profiles" from "anon";

revoke insert on table "public"."user_profiles" from "anon";

revoke references on table "public"."user_profiles" from "anon";

revoke select on table "public"."user_profiles" from "anon";

revoke trigger on table "public"."user_profiles" from "anon";

revoke truncate on table "public"."user_profiles" from "anon";

revoke update on table "public"."user_profiles" from "anon";

revoke delete on table "public"."user_profiles" from "authenticated";

revoke insert on table "public"."user_profiles" from "authenticated";

revoke references on table "public"."user_profiles" from "authenticated";

revoke select on table "public"."user_profiles" from "authenticated";

revoke trigger on table "public"."user_profiles" from "authenticated";

revoke truncate on table "public"."user_profiles" from "authenticated";

revoke update on table "public"."user_profiles" from "authenticated";

revoke delete on table "public"."user_profiles" from "service_role";

revoke insert on table "public"."user_profiles" from "service_role";

revoke references on table "public"."user_profiles" from "service_role";

revoke select on table "public"."user_profiles" from "service_role";

revoke trigger on table "public"."user_profiles" from "service_role";

revoke truncate on table "public"."user_profiles" from "service_role";

revoke update on table "public"."user_profiles" from "service_role";

revoke delete on table "public"."user_roles" from "anon";

revoke insert on table "public"."user_roles" from "anon";

revoke references on table "public"."user_roles" from "anon";

revoke select on table "public"."user_roles" from "anon";

revoke trigger on table "public"."user_roles" from "anon";

revoke truncate on table "public"."user_roles" from "anon";

revoke update on table "public"."user_roles" from "anon";

revoke delete on table "public"."user_roles" from "authenticated";

revoke insert on table "public"."user_roles" from "authenticated";

revoke references on table "public"."user_roles" from "authenticated";

revoke select on table "public"."user_roles" from "authenticated";

revoke trigger on table "public"."user_roles" from "authenticated";

revoke truncate on table "public"."user_roles" from "authenticated";

revoke update on table "public"."user_roles" from "authenticated";

revoke delete on table "public"."user_roles" from "service_role";

revoke insert on table "public"."user_roles" from "service_role";

revoke references on table "public"."user_roles" from "service_role";

revoke select on table "public"."user_roles" from "service_role";

revoke trigger on table "public"."user_roles" from "service_role";

revoke truncate on table "public"."user_roles" from "service_role";

revoke update on table "public"."user_roles" from "service_role";

revoke delete on table "public"."user_settings" from "anon";

revoke insert on table "public"."user_settings" from "anon";

revoke references on table "public"."user_settings" from "anon";

revoke select on table "public"."user_settings" from "anon";

revoke trigger on table "public"."user_settings" from "anon";

revoke truncate on table "public"."user_settings" from "anon";

revoke update on table "public"."user_settings" from "anon";

revoke delete on table "public"."user_settings" from "authenticated";

revoke insert on table "public"."user_settings" from "authenticated";

revoke references on table "public"."user_settings" from "authenticated";

revoke select on table "public"."user_settings" from "authenticated";

revoke trigger on table "public"."user_settings" from "authenticated";

revoke truncate on table "public"."user_settings" from "authenticated";

revoke update on table "public"."user_settings" from "authenticated";

revoke delete on table "public"."user_settings" from "service_role";

revoke insert on table "public"."user_settings" from "service_role";

revoke references on table "public"."user_settings" from "service_role";

revoke select on table "public"."user_settings" from "service_role";

revoke trigger on table "public"."user_settings" from "service_role";

revoke truncate on table "public"."user_settings" from "service_role";

revoke update on table "public"."user_settings" from "service_role";

revoke delete on table "public"."workspace_admin_settings" from "anon";

revoke insert on table "public"."workspace_admin_settings" from "anon";

revoke references on table "public"."workspace_admin_settings" from "anon";

revoke select on table "public"."workspace_admin_settings" from "anon";

revoke trigger on table "public"."workspace_admin_settings" from "anon";

revoke truncate on table "public"."workspace_admin_settings" from "anon";

revoke update on table "public"."workspace_admin_settings" from "anon";

revoke delete on table "public"."workspace_admin_settings" from "authenticated";

revoke insert on table "public"."workspace_admin_settings" from "authenticated";

revoke references on table "public"."workspace_admin_settings" from "authenticated";

revoke select on table "public"."workspace_admin_settings" from "authenticated";

revoke trigger on table "public"."workspace_admin_settings" from "authenticated";

revoke truncate on table "public"."workspace_admin_settings" from "authenticated";

revoke update on table "public"."workspace_admin_settings" from "authenticated";

revoke delete on table "public"."workspace_admin_settings" from "service_role";

revoke insert on table "public"."workspace_admin_settings" from "service_role";

revoke references on table "public"."workspace_admin_settings" from "service_role";

revoke select on table "public"."workspace_admin_settings" from "service_role";

revoke trigger on table "public"."workspace_admin_settings" from "service_role";

revoke truncate on table "public"."workspace_admin_settings" from "service_role";

revoke update on table "public"."workspace_admin_settings" from "service_role";

revoke delete on table "public"."workspace_application_settings" from "anon";

revoke insert on table "public"."workspace_application_settings" from "anon";

revoke references on table "public"."workspace_application_settings" from "anon";

revoke select on table "public"."workspace_application_settings" from "anon";

revoke trigger on table "public"."workspace_application_settings" from "anon";

revoke truncate on table "public"."workspace_application_settings" from "anon";

revoke update on table "public"."workspace_application_settings" from "anon";

revoke delete on table "public"."workspace_application_settings" from "authenticated";

revoke insert on table "public"."workspace_application_settings" from "authenticated";

revoke references on table "public"."workspace_application_settings" from "authenticated";

revoke select on table "public"."workspace_application_settings" from "authenticated";

revoke trigger on table "public"."workspace_application_settings" from "authenticated";

revoke truncate on table "public"."workspace_application_settings" from "authenticated";

revoke update on table "public"."workspace_application_settings" from "authenticated";

revoke delete on table "public"."workspace_application_settings" from "service_role";

revoke insert on table "public"."workspace_application_settings" from "service_role";

revoke references on table "public"."workspace_application_settings" from "service_role";

revoke select on table "public"."workspace_application_settings" from "service_role";

revoke trigger on table "public"."workspace_application_settings" from "service_role";

revoke truncate on table "public"."workspace_application_settings" from "service_role";

revoke update on table "public"."workspace_application_settings" from "service_role";

revoke delete on table "public"."workspace_credits" from "anon";

revoke insert on table "public"."workspace_credits" from "anon";

revoke references on table "public"."workspace_credits" from "anon";

revoke select on table "public"."workspace_credits" from "anon";

revoke trigger on table "public"."workspace_credits" from "anon";

revoke truncate on table "public"."workspace_credits" from "anon";

revoke update on table "public"."workspace_credits" from "anon";

revoke delete on table "public"."workspace_credits" from "authenticated";

revoke insert on table "public"."workspace_credits" from "authenticated";

revoke references on table "public"."workspace_credits" from "authenticated";

revoke select on table "public"."workspace_credits" from "authenticated";

revoke trigger on table "public"."workspace_credits" from "authenticated";

revoke truncate on table "public"."workspace_credits" from "authenticated";

revoke update on table "public"."workspace_credits" from "authenticated";

revoke delete on table "public"."workspace_credits" from "service_role";

revoke insert on table "public"."workspace_credits" from "service_role";

revoke references on table "public"."workspace_credits" from "service_role";

revoke select on table "public"."workspace_credits" from "service_role";

revoke trigger on table "public"."workspace_credits" from "service_role";

revoke truncate on table "public"."workspace_credits" from "service_role";

revoke update on table "public"."workspace_credits" from "service_role";

revoke delete on table "public"."workspace_credits_logs" from "anon";

revoke insert on table "public"."workspace_credits_logs" from "anon";

revoke references on table "public"."workspace_credits_logs" from "anon";

revoke select on table "public"."workspace_credits_logs" from "anon";

revoke trigger on table "public"."workspace_credits_logs" from "anon";

revoke truncate on table "public"."workspace_credits_logs" from "anon";

revoke update on table "public"."workspace_credits_logs" from "anon";

revoke delete on table "public"."workspace_credits_logs" from "authenticated";

revoke insert on table "public"."workspace_credits_logs" from "authenticated";

revoke references on table "public"."workspace_credits_logs" from "authenticated";

revoke select on table "public"."workspace_credits_logs" from "authenticated";

revoke trigger on table "public"."workspace_credits_logs" from "authenticated";

revoke truncate on table "public"."workspace_credits_logs" from "authenticated";

revoke update on table "public"."workspace_credits_logs" from "authenticated";

revoke delete on table "public"."workspace_credits_logs" from "service_role";

revoke insert on table "public"."workspace_credits_logs" from "service_role";

revoke references on table "public"."workspace_credits_logs" from "service_role";

revoke select on table "public"."workspace_credits_logs" from "service_role";

revoke trigger on table "public"."workspace_credits_logs" from "service_role";

revoke truncate on table "public"."workspace_credits_logs" from "service_role";

revoke update on table "public"."workspace_credits_logs" from "service_role";

revoke delete on table "public"."workspace_invitations" from "anon";

revoke insert on table "public"."workspace_invitations" from "anon";

revoke references on table "public"."workspace_invitations" from "anon";

revoke select on table "public"."workspace_invitations" from "anon";

revoke trigger on table "public"."workspace_invitations" from "anon";

revoke truncate on table "public"."workspace_invitations" from "anon";

revoke update on table "public"."workspace_invitations" from "anon";

revoke delete on table "public"."workspace_invitations" from "authenticated";

revoke insert on table "public"."workspace_invitations" from "authenticated";

revoke references on table "public"."workspace_invitations" from "authenticated";

revoke select on table "public"."workspace_invitations" from "authenticated";

revoke trigger on table "public"."workspace_invitations" from "authenticated";

revoke truncate on table "public"."workspace_invitations" from "authenticated";

revoke update on table "public"."workspace_invitations" from "authenticated";

revoke delete on table "public"."workspace_invitations" from "service_role";

revoke insert on table "public"."workspace_invitations" from "service_role";

revoke references on table "public"."workspace_invitations" from "service_role";

revoke select on table "public"."workspace_invitations" from "service_role";

revoke trigger on table "public"."workspace_invitations" from "service_role";

revoke truncate on table "public"."workspace_invitations" from "service_role";

revoke update on table "public"."workspace_invitations" from "service_role";

revoke delete on table "public"."workspace_members" from "anon";

revoke insert on table "public"."workspace_members" from "anon";

revoke references on table "public"."workspace_members" from "anon";

revoke select on table "public"."workspace_members" from "anon";

revoke trigger on table "public"."workspace_members" from "anon";

revoke truncate on table "public"."workspace_members" from "anon";

revoke update on table "public"."workspace_members" from "anon";

revoke delete on table "public"."workspace_members" from "authenticated";

revoke insert on table "public"."workspace_members" from "authenticated";

revoke references on table "public"."workspace_members" from "authenticated";

revoke select on table "public"."workspace_members" from "authenticated";

revoke trigger on table "public"."workspace_members" from "authenticated";

revoke truncate on table "public"."workspace_members" from "authenticated";

revoke update on table "public"."workspace_members" from "authenticated";

revoke delete on table "public"."workspace_members" from "service_role";

revoke insert on table "public"."workspace_members" from "service_role";

revoke references on table "public"."workspace_members" from "service_role";

revoke select on table "public"."workspace_members" from "service_role";

revoke trigger on table "public"."workspace_members" from "service_role";

revoke truncate on table "public"."workspace_members" from "service_role";

revoke update on table "public"."workspace_members" from "service_role";

revoke delete on table "public"."workspace_settings" from "anon";

revoke insert on table "public"."workspace_settings" from "anon";

revoke references on table "public"."workspace_settings" from "anon";

revoke select on table "public"."workspace_settings" from "anon";

revoke trigger on table "public"."workspace_settings" from "anon";

revoke truncate on table "public"."workspace_settings" from "anon";

revoke update on table "public"."workspace_settings" from "anon";

revoke delete on table "public"."workspace_settings" from "authenticated";

revoke insert on table "public"."workspace_settings" from "authenticated";

revoke references on table "public"."workspace_settings" from "authenticated";

revoke select on table "public"."workspace_settings" from "authenticated";

revoke trigger on table "public"."workspace_settings" from "authenticated";

revoke truncate on table "public"."workspace_settings" from "authenticated";

revoke update on table "public"."workspace_settings" from "authenticated";

revoke delete on table "public"."workspace_settings" from "service_role";

revoke insert on table "public"."workspace_settings" from "service_role";

revoke references on table "public"."workspace_settings" from "service_role";

revoke select on table "public"."workspace_settings" from "service_role";

revoke trigger on table "public"."workspace_settings" from "service_role";

revoke truncate on table "public"."workspace_settings" from "service_role";

revoke update on table "public"."workspace_settings" from "service_role";

revoke delete on table "public"."workspaces" from "anon";

revoke insert on table "public"."workspaces" from "anon";

revoke references on table "public"."workspaces" from "anon";

revoke select on table "public"."workspaces" from "anon";

revoke trigger on table "public"."workspaces" from "anon";

revoke truncate on table "public"."workspaces" from "anon";

revoke update on table "public"."workspaces" from "anon";

revoke delete on table "public"."workspaces" from "authenticated";

revoke insert on table "public"."workspaces" from "authenticated";

revoke references on table "public"."workspaces" from "authenticated";

revoke select on table "public"."workspaces" from "authenticated";

revoke trigger on table "public"."workspaces" from "authenticated";

revoke truncate on table "public"."workspaces" from "authenticated";

revoke update on table "public"."workspaces" from "authenticated";

revoke delete on table "public"."workspaces" from "service_role";

revoke insert on table "public"."workspaces" from "service_role";

revoke references on table "public"."workspaces" from "service_role";

revoke select on table "public"."workspaces" from "service_role";

revoke trigger on table "public"."workspaces" from "service_role";

revoke truncate on table "public"."workspaces" from "service_role";

revoke update on table "public"."workspaces" from "service_role";

alter table "public"."billing_customers" drop constraint "billing_customers_workspace_id_gateway_name_key";

alter table "public"."stripe_webhook_events" drop constraint "stripe_webhook_events_stripe_event_id_key";

alter table "public"."account_delete_tokens" drop constraint "account_delete_tokens_user_id_fkey";

alter table "public"."billing_customers" drop constraint "billing_customers_workspace_id_fkey";

alter table "public"."billing_invoices" drop constraint "billing_invoices_gateway_customer_id_fkey";

alter table "public"."billing_invoices" drop constraint "billing_invoices_gateway_price_id_fkey";

alter table "public"."billing_invoices" drop constraint "billing_invoices_gateway_product_id_fkey";

alter table "public"."billing_one_time_payments" drop constraint "billing_one_time_payments_gateway_customer_id_fkey";

alter table "public"."billing_one_time_payments" drop constraint "billing_one_time_payments_gateway_invoice_id_fkey";

alter table "public"."billing_one_time_payments" drop constraint "billing_one_time_payments_gateway_price_id_fkey";

alter table "public"."billing_one_time_payments" drop constraint "billing_one_time_payments_gateway_product_id_fkey";

alter table "public"."billing_payment_methods" drop constraint "billing_payment_methods_gateway_customer_id_fkey";

alter table "public"."billing_prices" drop constraint "billing_prices_gateway_product_id_fkey";

alter table "public"."billing_subscriptions" drop constraint "billing_subscriptions_gateway_customer_id_fkey";

alter table "public"."billing_subscriptions" drop constraint "billing_subscriptions_gateway_price_id_fkey";

alter table "public"."billing_subscriptions" drop constraint "billing_subscriptions_gateway_product_id_fkey";

alter table "public"."billing_usage_logs" drop constraint "billing_usage_logs_gateway_customer_id_fkey";

alter table "public"."billing_volume_tiers" drop constraint "billing_volume_tiers_gateway_price_id_fkey";

alter table "public"."chats" drop constraint "chats_project_id_fkey";

alter table "public"."chats" drop constraint "chats_user_id_fkey";

alter table "public"."marketing_blog_author_posts" drop constraint "marketing_blog_author_posts_author_id_fkey";

alter table "public"."marketing_blog_author_posts" drop constraint "marketing_blog_author_posts_post_id_fkey";

alter table "public"."marketing_blog_post_tags_relationship" drop constraint "marketing_blog_post_tags_relationship_blog_post_id_fkey";

alter table "public"."marketing_blog_post_tags_relationship" drop constraint "marketing_blog_post_tags_relationship_tag_id_fkey";

alter table "public"."marketing_changelog_author_relationship" drop constraint "marketing_changelog_author_relationship_author_id_fkey";

alter table "public"."marketing_changelog_author_relationship" drop constraint "marketing_changelog_author_relationship_changelog_id_fkey";

alter table "public"."marketing_feedback_board_subscriptions" drop constraint "marketing_feedback_board_subscriptions_board_id_fkey";

alter table "public"."marketing_feedback_board_subscriptions" drop constraint "marketing_feedback_board_subscriptions_user_id_fkey";

alter table "public"."marketing_feedback_boards" drop constraint "marketing_feedback_boards_created_by_fkey";

alter table "public"."marketing_feedback_comment_reactions" drop constraint "marketing_feedback_comment_reactions_comment_id_fkey";

alter table "public"."marketing_feedback_comment_reactions" drop constraint "marketing_feedback_comment_reactions_user_id_fkey";

alter table "public"."marketing_feedback_comments" drop constraint "marketing_feedback_comments_thread_id_fkey";

alter table "public"."marketing_feedback_comments" drop constraint "marketing_feedback_comments_user_id_fkey";

alter table "public"."marketing_feedback_thread_reactions" drop constraint "marketing_feedback_thread_reactions_thread_id_fkey";

alter table "public"."marketing_feedback_thread_reactions" drop constraint "marketing_feedback_thread_reactions_user_id_fkey";

alter table "public"."marketing_feedback_thread_subscriptions" drop constraint "marketing_feedback_thread_subscriptions_thread_id_fkey";

alter table "public"."marketing_feedback_thread_subscriptions" drop constraint "marketing_feedback_thread_subscriptions_user_id_fkey";

alter table "public"."marketing_feedback_threads" drop constraint "marketing_feedback_threads_user_id_fkey";

alter table "public"."project_comments" drop constraint "project_comments_in_reply_to_fkey";

alter table "public"."project_comments" drop constraint "project_comments_project_id_fkey";

alter table "public"."project_comments" drop constraint "project_comments_user_id_fkey";

alter table "public"."projects" drop constraint "projects_workspace_id_fkey";

alter table "public"."user_api_keys" drop constraint "user_api_keys_user_id_fkey";

alter table "public"."user_application_settings" drop constraint "user_application_settings_id_fkey";

alter table "public"."user_notifications" drop constraint "user_notifications_user_id_fkey";

alter table "public"."user_roles" drop constraint "user_roles_user_id_fkey";

alter table "public"."user_settings" drop constraint "user_settings_id_fkey";

alter table "public"."workspace_admin_settings" drop constraint "workspace_admin_settings_workspace_id_fkey";

alter table "public"."workspace_application_settings" drop constraint "workspace_application_settings_workspace_id_fkey";

alter table "public"."workspace_credits" drop constraint "workspace_credits_workspace_id_fkey";

alter table "public"."workspace_credits_logs" drop constraint "workspace_credits_logs_workspace_credits_id_fkey";

alter table "public"."workspace_credits_logs" drop constraint "workspace_credits_logs_workspace_id_fkey";

alter table "public"."workspace_invitations" drop constraint "workspace_invitations_invitee_user_id_fkey";

alter table "public"."workspace_invitations" drop constraint "workspace_invitations_inviter_user_id_fkey";

alter table "public"."workspace_invitations" drop constraint "workspace_invitations_workspace_id_fkey";

alter table "public"."workspace_members" drop constraint "workspace_members_workspace_id_fkey";

alter table "public"."workspace_members" drop constraint "workspace_members_workspace_member_id_fkey";

alter table "public"."workspace_settings" drop constraint "workspace_settings_workspace_id_fkey";

alter table "public"."stripe_webhook_events" drop constraint "stripe_webhook_events_pkey";

drop index if exists "public"."billing_customers_workspace_id_gateway_name_key";

drop index if exists "public"."idx_stripe_webhook_events_processed_at";

drop index if exists "public"."idx_stripe_webhook_events_stripe_event_id";

drop index if exists "public"."stripe_webhook_events_pkey";

drop index if exists "public"."stripe_webhook_events_stripe_event_id_key";

drop table "public"."stripe_webhook_events";

create table "public"."profiles" (
    "id" uuid not null,
    "email" text,
    "full_name" text,
    "avatar_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."profiles" enable row level security;

alter table "public"."account_delete_tokens" alter column "token" set default extensions.uuid_generate_v4();

alter table "public"."billing_payment_methods" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."billing_subscriptions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."billing_subscriptions" alter column "status" set data type public.subscription_status using "status"::text::public.subscription_status;

alter table "public"."billing_usage_logs" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."billing_volume_tiers" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."jobs" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."marketing_author_profiles" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."marketing_blog_posts" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."marketing_blog_posts" alter column "status" set default 'draft'::public.marketing_blog_post_status;

alter table "public"."marketing_blog_posts" alter column "status" set data type public.marketing_blog_post_status using "status"::text::public.marketing_blog_post_status;

alter table "public"."marketing_changelog" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."marketing_changelog" alter column "status" set default 'draft'::public.marketing_changelog_status;

alter table "public"."marketing_changelog" alter column "status" set data type public.marketing_changelog_status using "status"::text::public.marketing_changelog_status;

alter table "public"."marketing_feedback_board_subscriptions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."marketing_feedback_boards" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."marketing_feedback_comment_reactions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."marketing_feedback_comment_reactions" alter column "reaction_type" set data type public.marketing_feedback_reaction_type using "reaction_type"::text::public.marketing_feedback_reaction_type;

alter table "public"."marketing_feedback_comments" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."marketing_feedback_comments" alter column "moderator_hold_category" set data type public.marketing_feedback_moderator_hold_category using "moderator_hold_category"::text::public.marketing_feedback_moderator_hold_category;

alter table "public"."marketing_feedback_thread_reactions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."marketing_feedback_thread_reactions" alter column "reaction_type" set data type public.marketing_feedback_reaction_type using "reaction_type"::text::public.marketing_feedback_reaction_type;

alter table "public"."marketing_feedback_thread_subscriptions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."marketing_feedback_threads" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."marketing_feedback_threads" alter column "moderator_hold_category" set data type public.marketing_feedback_moderator_hold_category using "moderator_hold_category"::text::public.marketing_feedback_moderator_hold_category;

alter table "public"."marketing_feedback_threads" alter column "priority" set default 'low'::public.marketing_feedback_thread_priority;

alter table "public"."marketing_feedback_threads" alter column "priority" set data type public.marketing_feedback_thread_priority using "priority"::text::public.marketing_feedback_thread_priority;

alter table "public"."marketing_feedback_threads" alter column "status" set default 'open'::public.marketing_feedback_thread_status;

alter table "public"."marketing_feedback_threads" alter column "status" set data type public.marketing_feedback_thread_status using "status"::text::public.marketing_feedback_thread_status;

alter table "public"."marketing_feedback_threads" alter column "type" set default 'general'::public.marketing_feedback_thread_type;

alter table "public"."marketing_feedback_threads" alter column "type" set data type public.marketing_feedback_thread_type using "type"::text::public.marketing_feedback_thread_type;

alter table "public"."marketing_tags" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."project_comments" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."projects" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."projects" alter column "project_status" set default 'draft'::public.project_status;

alter table "public"."projects" alter column "project_status" set data type public.project_status using "project_status"::text::public.project_status;

alter table "public"."user_notifications" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."user_roles" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."user_roles" alter column "role" set data type public.app_role using "role"::text::public.app_role;

alter table "public"."workspace_application_settings" alter column "membership_type" set default 'solo'::public.workspace_membership_type;

alter table "public"."workspace_application_settings" alter column "membership_type" set data type public.workspace_membership_type using "membership_type"::text::public.workspace_membership_type;

alter table "public"."workspace_credits" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."workspace_credits_logs" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."workspace_invitations" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."workspace_invitations" alter column "invitee_user_role" set default 'member'::public.workspace_member_role_type;

alter table "public"."workspace_invitations" alter column "invitee_user_role" set data type public.workspace_member_role_type using "invitee_user_role"::text::public.workspace_member_role_type;

alter table "public"."workspace_invitations" alter column "status" set default 'active'::public.workspace_invitation_link_status;

alter table "public"."workspace_invitations" alter column "status" set data type public.workspace_invitation_link_status using "status"::text::public.workspace_invitation_link_status;

alter table "public"."workspace_members" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."workspace_members" alter column "workspace_member_role" set data type public.workspace_member_role_type using "workspace_member_role"::text::public.workspace_member_role_type;

alter table "public"."workspaces" alter column "id" set default extensions.uuid_generate_v4();

drop sequence if exists "public"."stripe_webhook_events_id_seq";

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX unique_workspace_gateway ON public.billing_customers USING btree (workspace_id, gateway_name);

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."billing_customers" add constraint "unique_workspace_gateway" UNIQUE using index "unique_workspace_gateway";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."account_delete_tokens" add constraint "account_delete_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."account_delete_tokens" validate constraint "account_delete_tokens_user_id_fkey";

alter table "public"."billing_customers" add constraint "billing_customers_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) not valid;

alter table "public"."billing_customers" validate constraint "billing_customers_workspace_id_fkey";

alter table "public"."billing_invoices" add constraint "billing_invoices_gateway_customer_id_fkey" FOREIGN KEY (gateway_customer_id) REFERENCES public.billing_customers(gateway_customer_id) ON DELETE CASCADE not valid;

alter table "public"."billing_invoices" validate constraint "billing_invoices_gateway_customer_id_fkey";

alter table "public"."billing_invoices" add constraint "billing_invoices_gateway_price_id_fkey" FOREIGN KEY (gateway_price_id) REFERENCES public.billing_prices(gateway_price_id) ON DELETE CASCADE not valid;

alter table "public"."billing_invoices" validate constraint "billing_invoices_gateway_price_id_fkey";

alter table "public"."billing_invoices" add constraint "billing_invoices_gateway_product_id_fkey" FOREIGN KEY (gateway_product_id) REFERENCES public.billing_products(gateway_product_id) ON DELETE CASCADE not valid;

alter table "public"."billing_invoices" validate constraint "billing_invoices_gateway_product_id_fkey";

alter table "public"."billing_one_time_payments" add constraint "billing_one_time_payments_gateway_customer_id_fkey" FOREIGN KEY (gateway_customer_id) REFERENCES public.billing_customers(gateway_customer_id) ON DELETE CASCADE not valid;

alter table "public"."billing_one_time_payments" validate constraint "billing_one_time_payments_gateway_customer_id_fkey";

alter table "public"."billing_one_time_payments" add constraint "billing_one_time_payments_gateway_invoice_id_fkey" FOREIGN KEY (gateway_invoice_id) REFERENCES public.billing_invoices(gateway_invoice_id) ON DELETE CASCADE not valid;

alter table "public"."billing_one_time_payments" validate constraint "billing_one_time_payments_gateway_invoice_id_fkey";

alter table "public"."billing_one_time_payments" add constraint "billing_one_time_payments_gateway_price_id_fkey" FOREIGN KEY (gateway_price_id) REFERENCES public.billing_prices(gateway_price_id) ON DELETE CASCADE not valid;

alter table "public"."billing_one_time_payments" validate constraint "billing_one_time_payments_gateway_price_id_fkey";

alter table "public"."billing_one_time_payments" add constraint "billing_one_time_payments_gateway_product_id_fkey" FOREIGN KEY (gateway_product_id) REFERENCES public.billing_products(gateway_product_id) ON DELETE CASCADE not valid;

alter table "public"."billing_one_time_payments" validate constraint "billing_one_time_payments_gateway_product_id_fkey";

alter table "public"."billing_payment_methods" add constraint "billing_payment_methods_gateway_customer_id_fkey" FOREIGN KEY (gateway_customer_id) REFERENCES public.billing_customers(gateway_customer_id) ON DELETE CASCADE not valid;

alter table "public"."billing_payment_methods" validate constraint "billing_payment_methods_gateway_customer_id_fkey";

alter table "public"."billing_prices" add constraint "billing_prices_gateway_product_id_fkey" FOREIGN KEY (gateway_product_id) REFERENCES public.billing_products(gateway_product_id) ON DELETE CASCADE not valid;

alter table "public"."billing_prices" validate constraint "billing_prices_gateway_product_id_fkey";

alter table "public"."billing_subscriptions" add constraint "billing_subscriptions_gateway_customer_id_fkey" FOREIGN KEY (gateway_customer_id) REFERENCES public.billing_customers(gateway_customer_id) ON DELETE CASCADE not valid;

alter table "public"."billing_subscriptions" validate constraint "billing_subscriptions_gateway_customer_id_fkey";

alter table "public"."billing_subscriptions" add constraint "billing_subscriptions_gateway_price_id_fkey" FOREIGN KEY (gateway_price_id) REFERENCES public.billing_prices(gateway_price_id) ON DELETE CASCADE not valid;

alter table "public"."billing_subscriptions" validate constraint "billing_subscriptions_gateway_price_id_fkey";

alter table "public"."billing_subscriptions" add constraint "billing_subscriptions_gateway_product_id_fkey" FOREIGN KEY (gateway_product_id) REFERENCES public.billing_products(gateway_product_id) ON DELETE CASCADE not valid;

alter table "public"."billing_subscriptions" validate constraint "billing_subscriptions_gateway_product_id_fkey";

alter table "public"."billing_usage_logs" add constraint "billing_usage_logs_gateway_customer_id_fkey" FOREIGN KEY (gateway_customer_id) REFERENCES public.billing_customers(gateway_customer_id) not valid;

alter table "public"."billing_usage_logs" validate constraint "billing_usage_logs_gateway_customer_id_fkey";

alter table "public"."billing_volume_tiers" add constraint "billing_volume_tiers_gateway_price_id_fkey" FOREIGN KEY (gateway_price_id) REFERENCES public.billing_prices(gateway_price_id) ON DELETE CASCADE not valid;

alter table "public"."billing_volume_tiers" validate constraint "billing_volume_tiers_gateway_price_id_fkey";

alter table "public"."chats" add constraint "chats_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE not valid;

alter table "public"."chats" validate constraint "chats_project_id_fkey";

alter table "public"."chats" add constraint "chats_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."chats" validate constraint "chats_user_id_fkey";

alter table "public"."marketing_blog_author_posts" add constraint "marketing_blog_author_posts_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.marketing_author_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_blog_author_posts" validate constraint "marketing_blog_author_posts_author_id_fkey";

alter table "public"."marketing_blog_author_posts" add constraint "marketing_blog_author_posts_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.marketing_blog_posts(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_blog_author_posts" validate constraint "marketing_blog_author_posts_post_id_fkey";

alter table "public"."marketing_blog_post_tags_relationship" add constraint "marketing_blog_post_tags_relationship_blog_post_id_fkey" FOREIGN KEY (blog_post_id) REFERENCES public.marketing_blog_posts(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_blog_post_tags_relationship" validate constraint "marketing_blog_post_tags_relationship_blog_post_id_fkey";

alter table "public"."marketing_blog_post_tags_relationship" add constraint "marketing_blog_post_tags_relationship_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.marketing_tags(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_blog_post_tags_relationship" validate constraint "marketing_blog_post_tags_relationship_tag_id_fkey";

alter table "public"."marketing_changelog_author_relationship" add constraint "marketing_changelog_author_relationship_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.marketing_author_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_changelog_author_relationship" validate constraint "marketing_changelog_author_relationship_author_id_fkey";

alter table "public"."marketing_changelog_author_relationship" add constraint "marketing_changelog_author_relationship_changelog_id_fkey" FOREIGN KEY (changelog_id) REFERENCES public.marketing_changelog(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_changelog_author_relationship" validate constraint "marketing_changelog_author_relationship_changelog_id_fkey";

alter table "public"."marketing_feedback_board_subscriptions" add constraint "marketing_feedback_board_subscriptions_board_id_fkey" FOREIGN KEY (board_id) REFERENCES public.marketing_feedback_boards(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_feedback_board_subscriptions" validate constraint "marketing_feedback_board_subscriptions_board_id_fkey";

alter table "public"."marketing_feedback_board_subscriptions" add constraint "marketing_feedback_board_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_feedback_board_subscriptions" validate constraint "marketing_feedback_board_subscriptions_user_id_fkey";

alter table "public"."marketing_feedback_boards" add constraint "marketing_feedback_boards_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_feedback_boards" validate constraint "marketing_feedback_boards_created_by_fkey";

alter table "public"."marketing_feedback_comment_reactions" add constraint "marketing_feedback_comment_reactions_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES public.marketing_feedback_comments(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_feedback_comment_reactions" validate constraint "marketing_feedback_comment_reactions_comment_id_fkey";

alter table "public"."marketing_feedback_comment_reactions" add constraint "marketing_feedback_comment_reactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_feedback_comment_reactions" validate constraint "marketing_feedback_comment_reactions_user_id_fkey";

alter table "public"."marketing_feedback_comments" add constraint "marketing_feedback_comments_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES public.marketing_feedback_threads(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_feedback_comments" validate constraint "marketing_feedback_comments_thread_id_fkey";

alter table "public"."marketing_feedback_comments" add constraint "marketing_feedback_comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_feedback_comments" validate constraint "marketing_feedback_comments_user_id_fkey";

alter table "public"."marketing_feedback_thread_reactions" add constraint "marketing_feedback_thread_reactions_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES public.marketing_feedback_threads(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_feedback_thread_reactions" validate constraint "marketing_feedback_thread_reactions_thread_id_fkey";

alter table "public"."marketing_feedback_thread_reactions" add constraint "marketing_feedback_thread_reactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_feedback_thread_reactions" validate constraint "marketing_feedback_thread_reactions_user_id_fkey";

alter table "public"."marketing_feedback_thread_subscriptions" add constraint "marketing_feedback_thread_subscriptions_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES public.marketing_feedback_threads(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_feedback_thread_subscriptions" validate constraint "marketing_feedback_thread_subscriptions_thread_id_fkey";

alter table "public"."marketing_feedback_thread_subscriptions" add constraint "marketing_feedback_thread_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_feedback_thread_subscriptions" validate constraint "marketing_feedback_thread_subscriptions_user_id_fkey";

alter table "public"."marketing_feedback_threads" add constraint "marketing_feedback_threads_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."marketing_feedback_threads" validate constraint "marketing_feedback_threads_user_id_fkey";

alter table "public"."project_comments" add constraint "project_comments_in_reply_to_fkey" FOREIGN KEY (in_reply_to) REFERENCES public.project_comments(id) ON DELETE SET NULL not valid;

alter table "public"."project_comments" validate constraint "project_comments_in_reply_to_fkey";

alter table "public"."project_comments" add constraint "project_comments_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE not valid;

alter table "public"."project_comments" validate constraint "project_comments_project_id_fkey";

alter table "public"."project_comments" add constraint "project_comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."project_comments" validate constraint "project_comments_user_id_fkey";

alter table "public"."projects" add constraint "projects_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."projects" validate constraint "projects_workspace_id_fkey";

alter table "public"."user_api_keys" add constraint "user_api_keys_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_api_keys" validate constraint "user_api_keys_user_id_fkey";

alter table "public"."user_application_settings" add constraint "user_application_settings_id_fkey" FOREIGN KEY (id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_application_settings" validate constraint "user_application_settings_id_fkey";

alter table "public"."user_notifications" add constraint "user_notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_notifications" validate constraint "user_notifications_user_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

alter table "public"."user_settings" add constraint "user_settings_id_fkey" FOREIGN KEY (id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_settings" validate constraint "user_settings_id_fkey";

alter table "public"."workspace_admin_settings" add constraint "workspace_admin_settings_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_admin_settings" validate constraint "workspace_admin_settings_workspace_id_fkey";

alter table "public"."workspace_application_settings" add constraint "workspace_application_settings_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_application_settings" validate constraint "workspace_application_settings_workspace_id_fkey";

alter table "public"."workspace_credits" add constraint "workspace_credits_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_credits" validate constraint "workspace_credits_workspace_id_fkey";

alter table "public"."workspace_credits_logs" add constraint "workspace_credits_logs_workspace_credits_id_fkey" FOREIGN KEY (workspace_credits_id) REFERENCES public.workspace_credits(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_credits_logs" validate constraint "workspace_credits_logs_workspace_credits_id_fkey";

alter table "public"."workspace_credits_logs" add constraint "workspace_credits_logs_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_credits_logs" validate constraint "workspace_credits_logs_workspace_id_fkey";

alter table "public"."workspace_invitations" add constraint "workspace_invitations_invitee_user_id_fkey" FOREIGN KEY (invitee_user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_invitations" validate constraint "workspace_invitations_invitee_user_id_fkey";

alter table "public"."workspace_invitations" add constraint "workspace_invitations_inviter_user_id_fkey" FOREIGN KEY (inviter_user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_invitations" validate constraint "workspace_invitations_inviter_user_id_fkey";

alter table "public"."workspace_invitations" add constraint "workspace_invitations_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_invitations" validate constraint "workspace_invitations_workspace_id_fkey";

alter table "public"."workspace_members" add constraint "workspace_members_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_members" validate constraint "workspace_members_workspace_id_fkey";

alter table "public"."workspace_members" add constraint "workspace_members_workspace_member_id_fkey" FOREIGN KEY (workspace_member_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_members" validate constraint "workspace_members_workspace_member_id_fkey";

alter table "public"."workspace_settings" add constraint "workspace_settings_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_settings" validate constraint "workspace_settings_workspace_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_customer_workspace_id(gateway_customer_id text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN (
        SELECT workspace_id 
        FROM public.billing_customers 
        WHERE billing_customers.gateway_customer_id = get_customer_workspace_id.gateway_customer_id
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_project_workspace_uuid(project_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN (
        SELECT workspace_id 
        FROM public.projects 
        WHERE id = project_id
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    new_workspace_id UUID;
    user_name TEXT;
    workspace_slug TEXT;
BEGIN
    -- Extract user name from metadata or email
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    -- Generate workspace slug from email
    workspace_slug := lower(split_part(NEW.email, '@', 1)) || '-workspace';

    -- 1. Create user profile
    INSERT INTO public.user_profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        user_name,
        NEW.raw_user_meta_data->>'avatar_url'
    );

    -- 2. Create personal workspace for the user
    INSERT INTO public.workspaces (id, slug, name, created_at)
    VALUES (
        NEW.id, -- Use user ID as workspace ID for personal workspaces
        workspace_slug,
        user_name || '''s Workspace',
        NOW()
    )
    RETURNING id INTO new_workspace_id;

    -- 3. Add user as owner of their workspace
    INSERT INTO public.workspace_members (
        id,
        workspace_id,
        workspace_member_id,
        workspace_member_role,
        added_at
    ) VALUES (
        gen_random_uuid(),
        new_workspace_id,
        NEW.id,
        'owner', -- Assuming 'owner' is a valid role
        NOW()
    );

    -- 4. Create pending billing customer record
    -- This will now run with definer's privileges (postgres role) bypassing RLS
    INSERT INTO public.billing_customers (
        gateway_customer_id,
        workspace_id,
        gateway_name,
        billing_email,
        default_currency,
        metadata
    ) VALUES (
        'pending_' || NEW.id::text,
        new_workspace_id,
        'stripe',
        NEW.email,
        'usd',
        jsonb_build_object(
            'status', 'pending_stripe_creation',
            'free_subscription_needed', true,
            'created_at', NOW(),
            'user_email', NEW.email,
            'user_name', user_name
        )
    );

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_application_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_roles.user_id = is_application_admin.user_id 
        AND role = 'admin'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(user_id uuid, workspace_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.workspace_members 
        WHERE workspace_member_id = user_id 
        AND workspace_members.workspace_id = is_workspace_admin.workspace_id
        AND role = 'admin'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_workspace_member(user_id uuid, workspace_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.workspace_members 
        WHERE workspace_member_id = user_id 
        AND workspace_members.workspace_id = is_workspace_member.workspace_id
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

create policy "Users can insert their own profile"
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view their own profile"
on "public"."profiles"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Admins can view settings"
on "public"."app_settings"
as permissive
for select
to authenticated
using (public.is_application_admin(auth.uid()));


create policy "Users can insert billing customer records for their workspace"
on "public"."billing_customers"
as permissive
for insert
to authenticated
with check ((workspace_id IN ( SELECT w.id
   FROM (public.workspaces w
     JOIN public.workspace_members wm ON ((w.id = wm.workspace_id)))
  WHERE (wm.workspace_member_id = auth.uid()))));


create policy "Users can update their own billing customer records"
on "public"."billing_customers"
as permissive
for update
to authenticated
using ((workspace_id IN ( SELECT w.id
   FROM (public.workspaces w
     JOIN public.workspace_members wm ON ((w.id = wm.workspace_id)))
  WHERE (wm.workspace_member_id = auth.uid()))));


create policy "Users can view their own billing customer records"
on "public"."billing_customers"
as permissive
for select
to authenticated
using ((workspace_id IN ( SELECT w.id
   FROM (public.workspaces w
     JOIN public.workspace_members wm ON ((w.id = wm.workspace_id)))
  WHERE (wm.workspace_member_id = auth.uid()))));


create policy "Published blog posts are visible to everyone"
on "public"."marketing_blog_posts"
as permissive
for select
to public
using ((status = 'published'::public.marketing_blog_post_status));


create policy "Workspace members can view projects"
on "public"."projects"
as permissive
for select
to authenticated
using (public.is_workspace_member(( SELECT auth.uid() AS uid), workspace_id));


create policy "Workspace admins can access settings"
on "public"."workspace_admin_settings"
as permissive
for all
to authenticated
using (public.is_workspace_admin(( SELECT auth.uid() AS uid), workspace_id));


create policy "Workspace members can access settings"
on "public"."workspace_application_settings"
as permissive
for all
to authenticated
using (public.is_workspace_member(( SELECT auth.uid() AS uid), workspace_id));


create policy "Workspace members can view credits"
on "public"."workspace_credits"
as permissive
for select
to authenticated
using (public.is_workspace_member(( SELECT auth.uid() AS uid), workspace_id));


create policy "Workspace admins can view credit logs"
on "public"."workspace_credits_logs"
as permissive
for select
to authenticated
using (public.is_workspace_admin(( SELECT auth.uid() AS uid), workspace_id));


create policy "Workspace admins can manage invitations"
on "public"."workspace_invitations"
as permissive
for all
to authenticated
using (public.is_workspace_admin(( SELECT auth.uid() AS uid), workspace_id));


create policy "Workspace admins can manage team members"
on "public"."workspace_members"
as permissive
for all
to authenticated
using (public.is_workspace_admin(( SELECT auth.uid() AS uid), workspace_id));


create policy "Workspace members can read team members"
on "public"."workspace_members"
as permissive
for select
to authenticated
using (public.is_workspace_member(( SELECT auth.uid() AS uid), workspace_id));


create policy "Workspace members can access settings"
on "public"."workspace_settings"
as permissive
for all
to authenticated
using (public.is_workspace_member(( SELECT auth.uid() AS uid), workspace_id));


create policy "Workspace members can read their workspaces"
on "public"."workspaces"
as permissive
for select
to authenticated
using (public.is_workspace_member(( SELECT auth.uid() AS uid), id));


create policy "Workspace members can update their workspaces"
on "public"."workspaces"
as permissive
for update
to authenticated
using (public.is_workspace_member(( SELECT auth.uid() AS uid), id));


CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


drop trigger if exists "on_auth_user_created" on "auth"."users";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

drop trigger if exists "objects_delete_delete_prefix" on "storage"."objects";

drop trigger if exists "objects_update_create_prefix" on "storage"."objects";

drop trigger if exists "prefixes_delete_hierarchy" on "storage"."prefixes";

CREATE TRIGGER objects_delete_cleanup AFTER DELETE ON storage.objects REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE FUNCTION storage.objects_delete_cleanup();

CREATE TRIGGER objects_update_cleanup AFTER UPDATE ON storage.objects REFERENCING OLD TABLE AS old_rows NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION storage.objects_update_cleanup();

CREATE TRIGGER prefixes_delete_cleanup AFTER DELETE ON storage.prefixes REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE FUNCTION storage.prefixes_delete_cleanup();


