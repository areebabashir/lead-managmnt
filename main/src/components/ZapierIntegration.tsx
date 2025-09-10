import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Zap } from 'lucide-react';

interface ZapierIntegrationProps {
  className?: string;
}

const ZapierIntegration: React.FC<ZapierIntegrationProps> = ({ className = '' }) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const webhookUrls = {
    facebook: `${window.location.origin.replace('3000', '8000')}/api/webhooks/facebook-lead`,
    general: `${window.location.origin.replace('3000', '8000')}/api/webhooks/zapier-lead`,
    test: `${window.location.origin.replace('3000', '8000')}/api/webhooks/test`
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(type);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Zap className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Zapier Integration</h3>
          <p className="text-sm text-gray-600">Connect Facebook Lead Ads to your CRM</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Facebook Lead Webhook */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Facebook Lead Ads Webhook</h4>
            <button
              onClick={() => copyToClipboard(webhookUrls.facebook, 'facebook')}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            >
              {copiedUrl === 'facebook' ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy URL
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Use this URL in Zapier to receive Facebook Lead Ads data
          </p>
          <div className="bg-gray-50 rounded-md p-3 font-mono text-sm text-gray-700 break-all">
            {webhookUrls.facebook}
          </div>
        </div>

        {/* General Zapier Webhook */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">General Zapier Webhook</h4>
            <button
              onClick={() => copyToClipboard(webhookUrls.general, 'general')}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
            >
              {copiedUrl === 'general' ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy URL
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Use this URL for any other lead sources via Zapier
          </p>
          <div className="bg-gray-50 rounded-md p-3 font-mono text-sm text-gray-700 break-all">
            {webhookUrls.general}
          </div>
        </div>

        {/* Test Webhook */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Test Webhook</h4>
            <button
              onClick={() => copyToClipboard(webhookUrls.test, 'test')}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-colors"
            >
              {copiedUrl === 'test' ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy URL
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Test endpoint to verify webhook connectivity
          </p>
          <div className="bg-gray-50 rounded-md p-3 font-mono text-sm text-gray-700 break-all">
            {webhookUrls.test}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900 mb-1">Setup Instructions</h5>
            <p className="text-sm text-blue-700 mb-2">
              Follow the complete setup guide to connect Facebook Lead Ads with Zapier.
            </p>
            <a
              href="/ZAPIER_FACEBOOK_SETUP.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View Setup Guide →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZapierIntegration;
